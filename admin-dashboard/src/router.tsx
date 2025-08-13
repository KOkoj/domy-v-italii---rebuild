import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RequireAuth } from '@/components/RequireAuth'
import { Layout } from '@/components/Layout'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { PropertiesPage } from '@/pages/properties/PropertiesPage'
import { PropertyNewPage } from '@/pages/properties/PropertyNewPage'
import { PropertyEditPage } from '@/pages/properties/PropertyEditPage'
import { BlogPage } from '@/pages/blog/BlogPage'
import { BlogNewPage } from '@/pages/blog/BlogNewPage'
import { BlogEditPage } from '@/pages/blog/BlogEditPage'
import { InquiriesPage } from '@/pages/inquiries/InquiriesPage'
import { InquiryDetailPage } from '@/pages/inquiries/InquiryDetailPage'
import { UsersPage } from '@/pages/users/UsersPage'
import { UserEditPage } from '@/pages/users/UserEditPage'
import { SettingsPage } from '@/pages/SettingsPage'

export const router = createBrowserRouter(
  [
    {
      path: '/login',
      element: <LoginPage />,
    },
    {
      path: '/',
      element: (
        <RequireAuth>
          <Layout>
            <Navigate to="/dashboard" replace />
          </Layout>
        </RequireAuth>
      ),
    },
    {
      path: '/dashboard',
      element: (
        <RequireAuth>
          <Layout>
            <DashboardPage />
          </Layout>
        </RequireAuth>
      ),
    },
    {
      path: '/properties',
      element: (
        <RequireAuth>
          <Layout>
            <PropertiesPage />
          </Layout>
        </RequireAuth>
      ),
    },
    {
      path: '/properties/new',
      element: (
        <RequireAuth>
          <Layout>
            <PropertyNewPage />
          </Layout>
        </RequireAuth>
      ),
    },
    {
      path: '/properties/:id',
      element: (
        <RequireAuth>
          <Layout>
            <PropertyEditPage />
          </Layout>
        </RequireAuth>
      ),
    },
    {
      path: '/blog',
      element: (
        <RequireAuth>
          <Layout>
            <BlogPage />
          </Layout>
        </RequireAuth>
      ),
    },
    {
      path: '/blog/new',
      element: (
        <RequireAuth>
          <Layout>
            <BlogNewPage />
          </Layout>
        </RequireAuth>
      ),
    },
    {
      path: '/blog/:id',
      element: (
        <RequireAuth>
          <Layout>
            <BlogEditPage />
          </Layout>
        </RequireAuth>
      ),
    },
    {
      path: '/inquiries',
      element: (
        <RequireAuth>
          <Layout>
            <InquiriesPage />
          </Layout>
        </RequireAuth>
      ),
    },
    {
      path: '/inquiries/:id',
      element: (
        <RequireAuth>
          <Layout>
            <InquiryDetailPage />
          </Layout>
        </RequireAuth>
      ),
    },
    {
      path: '/users',
      element: (
        <RequireAuth>
          <Layout>
            <UsersPage />
          </Layout>
        </RequireAuth>
      ),
    },
    {
      path: '/users/:id',
      element: (
        <RequireAuth>
          <Layout>
            <UserEditPage />
          </Layout>
        </RequireAuth>
      ),
    },
    {
      path: '/settings',
      element: (
        <RequireAuth>
          <Layout>
            <SettingsPage />
          </Layout>
        </RequireAuth>
      ),
    },
  ]
)
