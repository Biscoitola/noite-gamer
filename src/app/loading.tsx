export default function Loading() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#080808] px-4 text-center">
      <div className="grid justify-items-center gap-5">
        <div className="loader-ring" aria-hidden="true" />
        <div>
          <p className="text-sm font-black uppercase text-[#B45CFF]">Carregando sistema</p>
          <h1 className="mt-2 text-3xl font-black text-[#F5F5F5]">NOITE GAMER</h1>
        </div>
      </div>
    </div>
  );
}
