import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/SimpleAuthContext"
import { CompanyProvider } from "@/components/common/CompanyContext"

function App() {
  return (
    <AuthProvider>
      <CompanyProvider company={null}>
        <Pages />
        <Toaster />
      </CompanyProvider>
    </AuthProvider>
  )
}

export default App 