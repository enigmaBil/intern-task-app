# 🎨 Guide de Design - Dashboard Mini Jira

## ✅ Améliorations Implémentées

### 1. **Navbar avec Avatar et Dropdown**
- ✅ Suppression du texte "Bienvenue"
- ✅ Avatar utilisateur avec initiales
- ✅ Dropdown au clic avec :
  - Profil utilisateur (nom, email, rôle)
  - Lien Profil
  - Lien Paramètres
  - Déconnexion (en rouge)

**Composant:** [`UserDropdown.tsx`](src/presentation/components/layout/UserDropdown.tsx)

**Utilisation:**
```tsx
import { UserDropdown } from '@/presentation/components/layout/UserDropdown';

<header>
  <UserDropdown />
</header>
```

---

### 2. **Modals Réutilisables**

#### AddTaskModal
Modal pour ajouter une nouvelle tâche avec :
- Titre (requis)
- Description
- Heures estimées
- Date limite
- Toast de succès/erreur

**Composant:** [`AddTaskModal.tsx`](src/presentation/components/modals/AddTaskModal.tsx)

**Utilisation:**
```tsx
import { AddTaskModal } from '@/presentation/components/modals';

<AddTaskModal onTaskAdded={() => refetch()} />
```

#### AddScrumNoteModal
Modal pour ajouter une note scrum avec :
- Ce que j'ai fait (requis)
- Ce que je vais faire (requis)
- Blocages (optionnel)
- Toast de succès/erreur

**Composant:** [`AddScrumNoteModal.tsx`](src/presentation/components/modals/AddScrumNoteModal.tsx)

**Utilisation:**
```tsx
import { AddScrumNoteModal } from '@/presentation/components/modals';

<AddScrumNoteModal onNoteAdded={() => refetch()} />
```

---

### 3. **Composants UI Shadcn dans `/ui`**

Tous les composants shadcn sont maintenant dans `src/presentation/components/ui/` :

- ✅ `avatar.tsx` - Avatar utilisateur
- ✅ `button.tsx` - Boutons
- ✅ `dialog.tsx` - Modals
- ✅ `dropdown-menu.tsx` - Menus déroulants
- ✅ `alert-dialog.tsx` - Confirmations
- ✅ `sonner.tsx` - Notifications toast

**Ajouter un nouveau composant:**
```bash
npx shadcn@latest add [component-name]
```

---

### 4. **AlertDialogs pour Confirmations**

#### ConfirmDialog
AlertDialog réutilisable pour toutes les actions de confirmation (suppression, modification, etc.)

**Composant:** [`ConfirmDialog.tsx`](src/presentation/components/shared/ConfirmDialog.tsx)

**Utilisation:**
```tsx
import { ConfirmDialog } from '@/presentation/components/shared/ConfirmDialog';
import { useState } from 'react';

function MyComponent() {
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setDeleteOpen(true)}>
        Supprimer
      </Button>
      
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Confirmer la suppression"
        description="Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </>
  );
}
```

**Exemple avec TaskActions:**
```tsx
import { TaskActions } from '@/presentation/components/task/TaskActions';

<TaskActions 
  task={task}
  onDelete={() => refetch()}
  onEdit={() => console.log('Edit')}
/>
```

---

### 5. **Notifications avec Sonner**

Sonner est configuré globalement dans [`layout.tsx`](src/app/layout.tsx)

#### Types de notifications

**Success:**
```tsx
import { toast } from 'sonner';

toast.success('Opération réussie', {
  description: 'Les données ont été sauvegardées',
});
```

**Error:**
```tsx
toast.error('Erreur', {
  description: 'Une erreur est survenue',
});
```

**Info:**
```tsx
toast.info('Information', {
  description: 'Nouveau message reçu',
});
```

**Warning:**
```tsx
toast.warning('Attention', {
  description: 'Action requise',
});
```

**Promise (avec loading automatique):**
```tsx
toast.promise(
  apiCall(),
  {
    loading: 'Chargement...',
    success: 'Données chargées',
    error: 'Erreur de chargement',
  }
);
```

**Rich Colors:**
Le Toaster est configuré avec `richColors` pour des couleurs améliorées.

---

## 📂 Structure des Composants

```
frontend/src/presentation/components/
├── ui/                          # Composants shadcn (auto-générés)
│   ├── avatar.tsx
│   ├── button.tsx
│   ├── dialog.tsx
│   ├── alert-dialog.tsx
│   ├── dropdown-menu.tsx
│   └── sonner.tsx
│
├── layout/                      # Layout components
│   └── UserDropdown.tsx         # ⭐ Avatar + dropdown
│
├── modals/                      # Modals réutilisables
│   ├── index.ts
│   ├── AddTaskModal.tsx         # ⭐ Modal ajout tâche
│   └── AddScrumNoteModal.tsx    # ⭐ Modal ajout note
│
├── shared/                      # Composants partagés
│   ├── ConfirmDialog.tsx        # ⭐ AlertDialog réutilisable
│   ├── LoadingSpinner.tsx
│   ├── ErrorMessage.tsx
│   └── AuthProvider.tsx
│
├── task/                        # Composants tâches
│   ├── TaskCard.tsx
│   ├── TaskColumn.tsx
│   ├── TaskActions.tsx          # ⭐ Actions avec AlertDialog
│   └── KanbanBoard.tsx
│
└── user/                        # Composants utilisateurs
    ├── UserList.tsx
    └── UserProfile.tsx
```

---

## 🎯 Bonnes Pratiques

### 1. **Toujours utiliser les composants UI de `/ui`**
```tsx
// ✅ Bon
import { Button } from '@/presentation/components/ui/button';

// ❌ Mauvais
<button className="...">
```

### 2. **Utiliser ConfirmDialog pour toutes les actions destructrices**
```tsx
// ✅ Bon - Confirmation avant suppression
<ConfirmDialog
  variant="destructive"
  onConfirm={handleDelete}
/>

// ❌ Mauvais - Suppression directe
<Button onClick={handleDelete}>Supprimer</Button>
```

### 3. **Toujours afficher un toast après une action**
```tsx
// ✅ Bon
try {
  await deleteTask();
  toast.success('Tâche supprimée');
} catch {
  toast.error('Erreur de suppression');
}

// ❌ Mauvais - Pas de feedback utilisateur
await deleteTask();
```

### 4. **Utiliser les modals pour les formulaires**
```tsx
// ✅ Bon - Modal centralisé
<AddTaskModal onTaskAdded={refetch} />

// ❌ Mauvais - Formulaire inline complexe
<form>...</form>
```

---

## 🚀 Prochaines Étapes

### À Implémenter

1. **Modals d'édition**
   - EditTaskModal
   - EditScrumNoteModal

2. **Profil utilisateur**
   - Page profil complète
   - Modification des informations

3. **Paramètres**
   - Page paramètres
   - Préférences utilisateur

4. **Notifications en temps réel**
   - WebSocket pour notifications
   - Badge de compteur

5. **Filtres et recherche**
   - Filtrer les tâches
   - Recherche globale

---

## 📝 Exemples Complets

### Page complète avec tous les composants

```tsx
'use client';

import { useState } from 'react';
import { AddTaskModal } from '@/presentation/components/modals';
import { TaskActions } from '@/presentation/components/task/TaskActions';
import { ConfirmDialog } from '@/presentation/components/shared/ConfirmDialog';
import { toast } from 'sonner';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);

  const handleTaskAdded = () => {
    toast.success('Tâche ajoutée');
    // Recharger les tâches
  };

  return (
    <div>
      <header className="flex justify-between">
        <h1>Tâches</h1>
        <AddTaskModal onTaskAdded={handleTaskAdded} />
      </header>

      {tasks.map(task => (
        <div key={task.id}>
          <h3>{task.title}</h3>
          <TaskActions
            task={task}
            onDelete={() => setTasks(tasks.filter(t => t.id !== task.id))}
          />
        </div>
      ))}
    </div>
  );
}
```

---

## 🎨 Personnalisation des Couleurs

Modifier `tailwind.config.ts` pour personnaliser le thème :

```ts
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: 'hsl(222, 47%, 11%)',
        foreground: 'hsl(210, 40%, 98%)',
      },
      destructive: {
        DEFAULT: 'hsl(0, 84%, 60%)',
        foreground: 'hsl(210, 40%, 98%)',
      },
    },
  },
}
```

---

## 📚 Documentation Complète

- [Composants UI](src/presentation/components/README.md)
- [Shadcn UI Docs](https://ui.shadcn.com)
- [Sonner Toast Docs](https://sonner.emilkowal.ski)
