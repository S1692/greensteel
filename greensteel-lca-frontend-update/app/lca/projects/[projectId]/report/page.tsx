"use client"

import { PageShell } from "@/components/layout/PageShell"
import { KeyValueRow } from "@/components/molecules/KeyValueRow"
import { Table, TableRow, TableCell } from "@/components/atoms/Table"
import { Card } from "@/components/atoms/Card"
import { mockReportModel } from "@/lib/mocks"

interface ReportPageProps {
  params: { projectId: string }
}

export default function ReportPage({ params }: ReportPageProps) {
  const report = mockReportModel

  const handleDownload = (type: "pdf" | "excel") => {
    // TODO: 백엔드 연결 시 실제 다운로드 호출
    alert(`${type.toUpperCase()} 다운로드는 추후 제공 예정입니다.`)
  }

  return (
    <div className="min-h-screen">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{report.productInfo.productName}</h1>
          <p className="text-muted-foreground">담당자: {report.productInfo.owner} | 기간: {report.productInfo.period}</p>
        </div>

        <div className="space-y-8">
          {/* 헤더 액션 */}
          <div className="flex flex-wrap gap-2 justify-end">
            <button
              onClick={() => handleDownload("pdf")}
              className="px-3 py-1 text-sm rounded border border-border hover:bg-accent transition-colors"
            >
              PDF 다운로드
            </button>
            <button
              onClick={() => handleDownload("excel")}
              className="px-3 py-1 text-sm rounded border border-border hover:bg-accent transition-colors"
            >
              Excel 다운로드
            </button>
          </div>

        {/* 1. 제품 정보 */}
        <section className="bg-card border border-border/30 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
            1. 철강 제품 정보
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="surface-card">
              <div className="space-y-1">
                <KeyValueRow label="제품명" value={report.productInfo.productName} />
                <KeyValueRow label="제품 분류" value={report.productInfo.productClass || "철강 제품"} />
                <KeyValueRow label="주요 기능" value={report.productInfo.majorFunction} />
                <KeyValueRow label="보조 기능" value={report.productInfo.secondaryFunction || "-"} />
                <KeyValueRow label="기준 단위" value={report.productInfo.unit} />
              </div>
            </Card>
            <Card className="surface-card">
              <div className="space-y-1">
                <KeyValueRow label="최소 포장재" value={report.productInfo.packaging.min} />
                <KeyValueRow label="출하 포장재" value={report.productInfo.packaging.out} />
                <KeyValueRow label="제품 특성" value={report.productInfo.productFeatures || "-"} />
              </div>
            </Card>
          </div>
        </section>

        {/* 2. LCA 수행 정보 */}
        <section className="bg-card border border-border/30 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
            2. LCA 수행 정보
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-primary mb-3">생애주기 범위</h3>
              <div className="flex items-center gap-4 p-4 bg-accent border border-border rounded-lg">
                <div className="flex-1 h-2 bg-muted relative rounded">
                  <div className="absolute left-0 top-0 h-full w-1/3 bg-primary rounded-l"></div>
                  <div className="absolute left-1/3 top-0 h-full w-1/3 bg-primary/70"></div>
                </div>
                <div className="text-sm text-primary">{report.scope.lifecycle}</div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-primary mb-3">데이터 품질</h3>
              <Card className="surface-card">
                <ul className="space-y-2 text-sm">
                  <li>• <strong>시간적 범위:</strong> {report.scope.dataQuality.temporal}</li>
                  <li>• <strong>기술적 범위:</strong> {report.scope.dataQuality.technical}</li>
                  <li>• <strong>지리적 범위:</strong> {report.scope.dataQuality.geographic}</li>
                  <li>• <strong>데이터 출처:</strong> {report.scope.dataQuality.source}</li>
                </ul>
              </Card>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-primary mb-3">영향평가 방법론</h3>
              <div className="overflow-x-auto">
                <Table headers={["LCIA Method", "영향범주", "범주지표", "단위"]}>
                  {report.methodTable.map((method, index) => (
                    <TableRow key={index}>
                      <TableCell>IPCC 2021 GWP</TableCell>
                      <TableCell>{method.category}</TableCell>
                      <TableCell>{method.indicator}</TableCell>
                      <TableCell>{method.unit}</TableCell>
                    </TableRow>
                  ))}
                </Table>
              </div>
            </div>
          </div>
        </section>

        {/* 3. 결과 테이블 */}
        <section className="bg-card border border-border/30 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
            <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
            3. 철강 LCA 결과
          </h2>
          <div className="overflow-x-auto">
            <Table headers={["영향범주", "제조전", "제조", "전과정", "단위", "제조 기여율", "전체 기여율"]}>
              {report.resultsTable.map((result, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{result.category}</TableCell>
                  <TableCell>{result.preManufacture.toFixed(0)}</TableCell>
                  <TableCell>{result.manufacturing.toFixed(0)}</TableCell>
                  <TableCell className="font-medium">{result.total.toFixed(0)}</TableCell>
                  <TableCell>{result.unit}</TableCell>
                  <TableCell>{result.manufacturingContribution?.toFixed(1)}%</TableCell>
                  <TableCell>{result.totalContribution?.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </Table>
          </div>
        </section>
        </div>
      </div>
    </div>
  )
}
