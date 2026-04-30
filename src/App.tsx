import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout';
import { ProtectedRoute, AdminRoute } from './components/auth';
import { HomePage, TopicsPage, TopicDetailPage, QuestionPage, ExamPage, LoginPage, AdminPage, DashboardPage, ExamReviewPage, PrivacyAndTermsPage, PaymentSuccessPage, PaymentErrorPage } from './pages';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/privacy" element={<PrivacyAndTermsPage />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/payment/error" element={<PaymentErrorPage />} />
        {/* HomePage is public - no auth required */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
        </Route>
        {/* All other pages require authentication */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route path="topics" element={<TopicsPage />} />
            <Route path="topics/:topicSlug" element={<TopicDetailPage />} />
            <Route path="question/:topicSlug/:questionId" element={<QuestionPage />} />
            <Route path="exam" element={<ExamPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="review/:id" element={<ExamReviewPage />} />
            <Route element={<AdminRoute />}>
              <Route path="admin" element={<AdminPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
