import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus, faArrowRight, faPhone } from "@fortawesome/free-solid-svg-icons";
import { getUploadUrl } from "../../../config/api";
import "./style/UserTerbaru.css";

function getInisial(nama = "") {
  const parts = nama.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

const VERIF_LABELS = {
  pending: { text: "Perlu Verifikasi", cls: "pending" },
  verified: { text: "Terverifikasi", cls: "verified" },
  rejected: { text: "Ditolak", cls: "rejected" },
};

function UserTerbaru({ userTerbaru = [] }) {
  const navigate = useNavigate();

  return (
    <div className="sdu-admin-recent-card">
      <div className="sdu-recent-header">
        <div className="sdu-recent-title-group">
          <div className="sdu-recent-icon-wrap user">
            <FontAwesomeIcon icon={faUserPlus} />
          </div>
          <div>
            <h3 className="sdu-recent-title">Pendaftar & Warga Terbaru</h3>
            <span className="sdu-recent-sub">
              Status verifikasi identitas warga dalam sistem SDU
            </span>
          </div>
        </div>

        <Link to="/admin/user" className="sdu-recent-link">
          <span>Kelola Warga</span>
          <FontAwesomeIcon icon={faArrowRight} />
        </Link>
      </div>

      <div className="sdu-recent-list">
        {userTerbaru.length === 0 ? (
          <div className="sdu-recent-empty">Belum ada pendaftar warga baru.</div>
        ) : (
          userTerbaru.map((u) => {
            const verif = VERIF_LABELS[u.status_verifikasi || "pending"];

            return (
              <div
                className="sdu-recent-user-item clickable"
                key={u.id}
                onClick={() => navigate(`/admin/user/${u.id}`)}
              >
                {u.foto_profil ? (
                  <img
                    src={getUploadUrl("profil", u.foto_profil)}
                    alt={u.nama}
                    className="sdu-user-avatar-thumb"
                  />
                ) : (
                  <div className="sdu-user-avatar-initial">
                    {getInisial(u.nama)}
                  </div>
                )}

                <div className="sdu-recent-user-info">
                  <strong className="sdu-user-name">{u.nama}</strong>
                  <span className="sdu-user-phone">
                    <FontAwesomeIcon icon={faPhone} /> {u.no_hp}
                  </span>
                </div>

                <span className={`sdu-recent-verif-tag ${verif.cls}`}>
                  {verif.text}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default UserTerbaru;
