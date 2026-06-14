import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Card, Form, Select, DatePicker, Button, Typography, Row, Col, Divider, Space } from 'antd'
import { DownloadOutlined, FilePdfOutlined, FileExcelOutlined, FileTextOutlined } from '@ant-design/icons'
import { downloadReport } from './reportsSlice'
import PageHeader from '../../components/common/PageHeader'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

const REPORT_TYPES = [
  { value: 'daily', label: 'Daily Report' },
  { value: 'weekly', label: 'Weekly Report' },
  { value: 'monthly', label: 'Monthly Report' },
  { value: 'yearly', label: 'Yearly Report' },
]

const FORMAT_CARDS = [
  { format: 'pdf', label: 'PDF Report', icon: <FilePdfOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />, description: 'Formatted PDF with tables and summary' },
  { format: 'excel', label: 'Excel Spreadsheet', icon: <FileExcelOutlined style={{ fontSize: 32, color: '#52c41a' }} />, description: 'Excel file with multiple sheets' },
  { format: 'csv', label: 'CSV Export', icon: <FileTextOutlined style={{ fontSize: 32, color: '#1677ff' }} />, description: 'Raw CSV data for custom analysis' },
]

export default function Reports() {
  const dispatch = useDispatch()
  const { loading } = useSelector((s) => s.reports)
  const [form] = Form.useForm()
  const [selectedFormat, setSelectedFormat] = useState(null)

  const handleDownload = (format) => {
    setSelectedFormat(format)
    form.validateFields().then((values) => {
      dispatch(downloadReport({
        format,
        report_type: values.report_type,
        date_from: values.date_range?.[0]?.format('YYYY-MM-DD'),
        date_to: values.date_range?.[1]?.format('YYYY-MM-DD'),
      }))
    })
  }

  return (
    <div>
      <PageHeader title="Financial Reports" subtitle="Export your financial data as PDF, Excel, or CSV" />

      <Card>
        <Title level={5}>Configure Report</Title>
        <Form form={form} layout="vertical" initialValues={{ report_type: 'monthly' }}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="report_type" label="Report Type" rules={[{ required: true }]}>
                <Select>
                  {REPORT_TYPES.map((t) => <Select.Option key={t.value} value={t.value}>{t.label}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="date_range" label="Date Range">
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>

        <Divider />

        <Title level={5}>Choose Export Format</Title>
        <Row gutter={[16, 16]}>
          {FORMAT_CARDS.map(({ format, label, icon, description }) => (
            <Col key={format} xs={24} sm={8}>
              <Card
                hoverable
                style={{ textAlign: 'center', cursor: 'pointer' }}
                onClick={() => handleDownload(format)}
              >
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  {icon}
                  <Text strong>{label}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>{description}</Text>
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    loading={loading && selectedFormat === format}
                    onClick={(e) => { e.stopPropagation(); handleDownload(format) }}
                    block
                  >
                    Download {format.toUpperCase()}
                  </Button>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  )
}
