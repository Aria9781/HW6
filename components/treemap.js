import { treemap, hierarchy, scaleOrdinal, schemeDark2, format } from "d3";

function LeafText({ d }) {
    const lines = d.ancestors()
        .reverse()
        .slice(1)
        .map(node => `${node.data.attr}: ${node.data.name}`);

    lines.push(`Value: ${format(",")(d.value)}`);

    return (
        <text
            x={d.x0 + 5}
            y={d.y0 + 15}
            fontSize={12}
            fill="white"
            pointerEvents="none"
        >
            {lines.map((line, i) => (
                <tspan key={i} x={d.x0 + 5} dy={i === 0 ? 0 : 18}>
                    {line}
                </tspan>
            ))}
        </text>
    );
}

function GroupLabel({ d }) {
    const w = d.x1 - d.x0;
    const h = d.y1 - d.y0;
    const fontSize = Math.max(18, Math.min(42, Math.min(w, h) / 3));
    const label = `${d.data.attr}: ${d.data.name}`;

    if (w < 100 && h > w) {
        return (
            <text
                transform={`translate(${(d.x0 + d.x1) / 2}, ${(d.y0 + d.y1) / 2}) rotate(90)`}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={fontSize}
                fontWeight="bold"
                fill="black"
                opacity={0.35}
                pointerEvents="none"
            >
                {label}
            </text>
        );
    }

    return (
        <text
            x={(d.x0 + d.x1) / 2}
            y={(d.y0 + d.y1) / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={fontSize}
            fontWeight="bold"
            fill="black"
            opacity={0.35}
            pointerEvents="none"
        >
            {label}
        </text>
    );
}

export function TreeMap(props) {
    const { margin, svg_width, svg_height, tree, selectedCell, setSelectedCell } = props;

    const innerWidth = svg_width - margin.left - margin.right;
    const innerHeight = svg_height - margin.top - margin.bottom;

    const root = hierarchy(tree)
        .sum(d => d.children ? 0 : d.value)
        .sort((a, b) => b.value - a.value);

    treemap()
        treemap()
        .size([innerWidth, innerHeight])
        .paddingOuter(2)     //黑框之间
        .paddingInner(d => {
            if (d.depth === 0) return 4;   // 👉 控制黑框之间
            if (d.depth === 1) return 1;   // 👉 控制黑框内部
            return 1;                      // 👉 控制更细层
        })
        (root);
        
    const leaves = root.leaves();
    const firstLevelGroups = root.children || [];

    const color = scaleOrdinal()
        .range(schemeDark2);

    const getFillColor = (d) => {
        // 如果只有一个或两个 attributes，保持绿色底色
        if (root.height <= 2) {
            return "#2fa983";
        }

        // 如果有三个 attributes，用第二层 attribute 分类上色
        const secondLevel = d.ancestors().find(node => node.depth === 2);
        return color(secondLevel ? secondLevel.data.name : d.data.name);
    };

    return (
        <svg
            viewBox={`0 0 ${svg_width} ${svg_height}`}
            preserveAspectRatio="xMidYMid meet"
            style={{ width: "100%", height: "100%" }}
        >
            <g transform={`translate(${margin.left}, ${margin.top})`}>

                {leaves.map((d, i) => (
                    <g key={`leaf-${i}`}>
                        <rect
                            x={d.x0}
                            y={d.y0}
                            width={d.x1 - d.x0}
                            height={d.y1 - d.y0}
                            fill={getFillColor(d)}
                            stroke="white"
                            strokeWidth={2}
                        />
                        <LeafText d={d} />
                    </g>
                ))}

                {firstLevelGroups.map((d, i) => (
                    <g key={`group-${i}`}>
                        <GroupLabel d={d} />
                        <rect
                            x={d.x0}
                            y={d.y0}
                            width={d.x1 - d.x0}
                            height={d.y1 - d.y0}
                            fill="none"
                            stroke="black"
                            strokeWidth={2}
                        />
                    </g>
                ))}

            </g>
        </svg>
    );
}