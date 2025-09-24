import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Retiradas() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redireciona automaticamente para o Almoxarifado com a aba de retiradas
    window.location.href = createPageUrl("Warehouse") + "?tab=retiradas";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Redirecionando...</h1>
        <p className="text-slate-600">A funcionalidade de Retiradas foi movida para o Almoxarifado.</p>
      </div>
    </div>
  );
}