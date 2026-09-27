import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useGlobalData } from '../../context/GlobalDataContext';
import { toast } from 'react-hot-toast';

export default function AdminCategories() {
  const { categories, addCategory, updateCategory, deleteCategory } = useGlobalData();
  const shouldReduceMotion = useReducedMotion();
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('El nombre de la categoría es requerido');
      return;
    }
    try {
      if (editingId) {
        await updateCategory(editingId, { name });
        toast.success('Categoría actualizada');
      } else {
        await addCategory({ name });
        toast.success('Categoría creada');
      }
      setName('');
      setEditingId(null);
    } catch (err) {
      toast.error(err.message || 'No se pudo guardar la categoría. Inténtalo de nuevo.');
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat._id || cat.id);
    setName(cat.nombre || cat.name || '');
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta categoría?')) {
      try {
        await deleteCategory(id);
        toast.success('Categoría eliminada');
      } catch (err) {
        toast.error(err.message || 'No se pudo eliminar la categoría. Inténtalo de nuevo.');
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName('');
  };

  const categoryList = categories || [];

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-7 pb-8">
      <motion.header
        initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#17211c] via-[#121a17] to-[#101416] px-5 py-6 sm:px-7 sm:py-7"
      >
        <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full border border-[#30b466]/10" />
        <div className="pointer-events-none absolute -right-2 -top-16 h-44 w-44 rounded-full border border-[#30b466]/10" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#63d895]">Cat&aacute;logo</p>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-[30px]">Gesti&oacute;n de categor&iacute;as</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">Organiza los productos en grupos claros para que tus clientes encuentren lo que buscan.</p>
          </div>
          <div className="flex w-fit items-center gap-3 rounded-xl border border-white/[0.08] bg-black/20 px-4 py-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#30b466]/10 text-lg font-bold text-[#63d895]">{categoryList.length}</span>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Categor&iacute;as<br /><strong className="text-sm font-semibold normal-case tracking-normal text-slate-200">registradas</strong></span>
          </div>
        </div>
      </motion.header>

      <motion.section
        initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: shouldReduceMotion ? 0 : 0.06 }}
        className={`rounded-2xl border bg-[#161b1e] p-5 shadow-[0_16px_50px_rgba(0,0,0,0.12)] sm:p-6 ${editingId ? 'border-[#30b466]/40' : 'border-white/[0.07]'}`}
      >
        <div className="mb-5 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#30b466]/10 text-[#63d895]" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>
          </span>
          <div>
            <h2 className="text-base font-semibold text-white">{editingId ? 'Editar categor&iacute;a' : 'Nueva categor&iacute;a'}</h2>
            <p className="mt-0.5 text-xs text-slate-500">Usa un nombre breve y f&aacute;cil de reconocer.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label htmlFor="category-name" className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Nombre de la categor&iacute;a</label>
            <input
              id="category-name"
              type="text"
              placeholder="Ej. Suplementos, vitaminas..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0d1114] px-4 py-3 text-sm text-white placeholder:text-slate-600 transition focus:border-[#30b466]/70 focus:outline-none focus:ring-2 focus:ring-[#30b466]/15"
            />
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            {editingId && (
              <button type="button" onClick={cancelEdit} className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:bg-white/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400">
                Cancelar
              </button>
            )}
            <button type="submit" className="rounded-xl bg-[#30b466] px-5 py-3 text-sm font-bold text-[#07130c] shadow-[0_8px_24px_rgba(48,180,102,0.16)] transition hover:-translate-y-0.5 hover:bg-[#3ac574] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#63d895]">
              {editingId ? 'Guardar cambios' : 'Crear categor&iacute;a'}
            </button>
          </div>
        </form>
      </motion.section>

      <section aria-labelledby="category-list-title" className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#14191c] shadow-[0_16px_50px_rgba(0,0,0,0.12)]">
        <div className="flex flex-col gap-1 border-b border-white/[0.06] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 id="category-list-title" className="text-base font-semibold text-white">Categor&iacute;as del cat&aacute;logo</h2>
            <p className="mt-1 text-xs text-slate-500">Administra los nombres que aparecen al explorar productos.</p>
          </div>
          <span className="mt-2 w-fit rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs text-slate-400 sm:mt-0">{categoryList.length} en total</span>
        </div>

        {categoryList.length > 0 ? (
          <div className="divide-y divide-white/[0.06]">
            {categoryList.map((cat, index) => {
              const id = cat._id || cat.id;
              return (
                <motion.article
                  key={id}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: shouldReduceMotion ? 0 : Math.min(index * 0.035, 0.21) }}
                  className="group flex flex-col gap-4 px-5 py-4 transition-colors hover:bg-white/[0.025] sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#30b466]/15 bg-[#30b466]/[0.07] text-xs font-bold text-[#63d895]">{String(index + 1).padStart(2, '0')}</span>
                    <div className="min-w-0">
                      <p className="break-words text-sm font-semibold text-slate-100">{cat.nombre || cat.name}</p>
                      <p className="mt-1 font-mono text-[10px] text-slate-500">ID: {String(id || '').substring(0, 8)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pl-14 sm:pl-0">
                    <button type="button" onClick={() => startEdit(cat)} aria-label={`Editar ${cat.nombre || cat.name}`} className="rounded-lg border border-[#30b466]/20 bg-[#30b466]/[0.07] px-4 py-2 text-xs font-bold text-[#63d895] transition hover:border-[#30b466]/40 hover:bg-[#30b466]/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#63d895]">Editar</button>
                    <button type="button" onClick={() => handleDelete(id)} aria-label={`Eliminar ${cat.nombre || cat.name}`} className="rounded-lg border border-rose-400/15 bg-rose-400/[0.05] px-4 py-2 text-xs font-bold text-rose-300 transition hover:border-rose-400/30 hover:bg-rose-400/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-300">Eliminar</button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.03] text-slate-500" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.6"><path d="M4 7.5h16M4 12h16M4 16.5h10" strokeLinecap="round" /><circle cx="18" cy="16.5" r="2.5" /></svg>
            </span>
            <h3 className="text-sm font-semibold text-slate-200">A&uacute;n no hay categor&iacute;as</h3>
            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">Crea la primera categor&iacute;a para empezar a organizar los productos de la tienda.</p>
          </div>
        )}
      </section>
    </div>
  );
}
