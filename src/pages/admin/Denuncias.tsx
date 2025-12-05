import { AdminLayout } from "@/components/admin/AdminLayout";
import { ReportsModeration } from "@/components/admin/ReportsModeration";

const Denuncias = () => {
  return (
    <AdminLayout title="Denúncias">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Denúncias e Moderação</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie denúncias e moderação de conteúdo
        </p>
      </div>

      <ReportsModeration />
    </AdminLayout>
  );
};

export default Denuncias;
