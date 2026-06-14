import { Spin } from 'antd'

export default function LoadingSpinner({ fullScreen = false }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: fullScreen ? '100vh' : 200,
      }}
    >
      <Spin size="large" />
    </div>
  )
}
