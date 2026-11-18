import React from "react";
import ProfilComponent from "../../components/ProfilComponent";
import AdminLayout from "../../layouts/AdminLayout";
import { faUserGear } from "@fortawesome/free-solid-svg-icons";

function AdminProfil() {
  return (
    <AdminLayout
      eyebrow="PENGATURAN AKUN OPERASIONAL"
      title="Profil Admin Depo"
      subtitle="Perbarui identitas profil operasional dan kontak WhatsApp depo Anda."
      icon={faUserGear}
    >
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>
        <ProfilComponent redirecTo="/admin/dashboard" isEmbedded={true} />
      </div>
    </AdminLayout>
  );
}

export default AdminProfil;
