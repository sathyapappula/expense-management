import { useIsMobile } from '../hooks/useIsMobile'
import MobileLayout from './MobileLayout'
import AppLayout from './AppLayout'

export default function ResponsiveLayout() {
  const isMobile = useIsMobile()
  return isMobile ? <MobileLayout /> : <AppLayout />
}
