import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { rows } = body

  const headers = Object.keys(rows[0])
  const data = rows

  const summary = headers.map((col) => {
    const colValues = data.map((row) => row[col] ?? "").filter((v) => v !== "")
    const numericValues = colValues.filter((val) => !isNaN(Number(val)))
    const unique = [...new Set(colValues)]

    let type = "categorical"
    if (unique.length <= 2) type = "binary"
    else if (numericValues.length >= colValues.length * 0.8) type = "numeric"

    return {
      name: col,
      type,
      sample_value: colValues[0],
      missing_percentage: Math.round((data.filter((row) => !row[col]).length / data.length) * 100),
      unique_values: type !== "numeric" ? unique.slice(0, 5) : undefined,
    }
  })

  const suggested_target =
    summary.find((c) => c.name.toLowerCase().includes("target") || c.name.toLowerCase().includes("label"))?.name ||
    summary.at(-1)?.name

  return NextResponse.json({
    num_rows: data.length,
    columns: summary,
    suggested_target,
  })
}
