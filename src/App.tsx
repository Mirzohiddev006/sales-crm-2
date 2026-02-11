import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "sonner"

import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { LoginPage } from "@/pages/LoginPage"
import { DashboardPage } from "@/pages/DashboardPage"
import { ClientsListPage } from "@/pages/clients/ClientsListPage"
import { ClientDetailPage } from "@/pages/clients/ClientDetailPage"
import { ReservationsPage } from "@/pages/ReservationsPage"
import { ConversationsPage } from "@/pages/ConversationsPage"
import { PDFChannelsListPage } from "@/pages/pdfchannels/PDFChannelsListPage"
import { PDFChannelDetailPage } from "@/pages/pdfchannels/PDFChannelDetailPage"
import { PDFChannelFormPage } from "@/pages/pdfchannels/PDFChannelFormPage"

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          
          {/* Clients */}
          <Route
            path="/clients"
            element={
              <ProtectedRoute>
                <ClientsListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients/:id"
            element={
              <ProtectedRoute>
                <ClientDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Reservations */}
          <Route
            path="/reservations"
            element={
              <ProtectedRoute>
                <ReservationsPage />
              </ProtectedRoute>
            }
          />

          {/* Conversations */}
          <Route
            path="/conversations"
            element={
              <ProtectedRoute>
                <ConversationsPage />
              </ProtectedRoute>
            }
          />

          {/* PDF Channels */}
          <Route
            path="/pdf-channels"
            element={
              <ProtectedRoute>
                <PDFChannelsListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pdf-channels/create"
            element={
              <ProtectedRoute>
                <PDFChannelFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pdf-channels/:id"
            element={
              <ProtectedRoute>
                <PDFChannelDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pdf-channels/:id/edit"
            element={
              <ProtectedRoute>
                <PDFChannelFormPage />
              </ProtectedRoute>
            }
          />

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>

      <Toaster position="top-right" richColors />
    </>
  )
}

export default App
