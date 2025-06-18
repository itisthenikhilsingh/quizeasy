"use client";
import React, { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import * as echarts from "echarts";
import "echarts-wordcloud";

type Props = {
  formattedTopics: { text: string; value: number }[];
};

const WordCloud = ({ formattedTopics }: Props) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current, undefined, {
      renderer: "canvas",
    });

    chart.setOption({
      backgroundColor: "transparent",
      series: [
        {
          type: "wordCloud",
          shape: "circle",
          sizeRange: [16, 60],
          rotationRange: [0, 0],
          gridSize: 10,
          drawOutOfBound: false,
          textStyle: {
            fontFamily: "Times",
            fontWeight: "bold",
            color: theme.theme === "dark" ? "#fff" : "#000",
          },
          data: formattedTopics.map((t) => ({
            name: t.text,
            value: t.value,
          })),
        },
      ],
    });

    // Click event
    chart.on("click", (params) => {
      if (params.name) {
        router.push("/quiz?topic=" + encodeURIComponent(params.name));
      }
    });

    // Cleanup
    return () => {
      chart.dispose();
    };
  }, [formattedTopics, theme.theme, router]);

  return (
    <div
      ref={chartRef}
      style={{ width: "100%", height: 550, minHeight: 300 }}
    />
  );
};

export default WordCloud;
