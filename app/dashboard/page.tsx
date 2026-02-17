import DashboardContent from '@/components/DashboardContent';
import ProtectedRoute from '@/components/ProtectedRoute';

export default async function DashboardPage() {
    return (
        <ProtectedRoute>
            <DashboardContent />
        </ProtectedRoute>
    );
}
