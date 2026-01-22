# Composants UI et Modals

Ce dossier contient tous les composants réutilisables pour l'interface utilisateur.

## Structure

```
presentation/components/
├── ui/                     # Composants shadcn/ui (générés automatiquement)
│   ├── avatar.tsx
│   ├── button.tsx
│   ├── dialog.tsx
│   ├── alert-dialog.tsx
│   ├── dropdown-menu.tsx
│   └── sonner.tsx
├── layout/                 # Composants de mise en page
│   └── UserDropdown.tsx    # Dropdown utilisateur avec avatar
├── modals/                 # Modals réutilisables
│   ├── AddTaskModal.tsx
│   └── AddScrumNoteModal.tsx
├── shared/                 # Composants partagés
│   ├── ConfirmDialog.tsx   # AlertDialog réutilisable
│   ├── LoadingSpinner.tsx
│   └── ErrorMessage.tsx
├── task/                   # Composants spécifiques aux tâches
│   ├── TaskCard.tsx
│   ├── TaskColumn.tsx
│   ├── TaskActions.tsx     # Actions avec AlertDialogs
│   └── KanbanBoard.tsx
└── user/                   # Composants spécifiques aux utilisateurs
    ├── UserList.tsx
    └── UserProfile.tsx
```

## Utilisation

### 1. Modals

```tsx
import { AddTaskModal, AddScrumNoteModal } from '@/presentation/components/modals';

function MyPage() {
  return (
    <div>
      <AddTaskModal onTaskAdded={() => console.log('Tâche ajoutée')} />
      <AddScrumNoteModal onNoteAdded={() => console.log('Note ajoutée')} />
    </div>
  );
}
```

### 2. AlertDialogs

```tsx
import { ConfirmDialog } from '@/presentation/components/shared/ConfirmDialog';
import { useState } from 'react';

function MyComponent() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Supprimer</button>
      
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Confirmer la suppression"
        description="Êtes-vous sûr de vouloir supprimer cet élément ?"
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={() => console.log('Supprimé')}
        variant="destructive"
      />
    </>
  );
}
```

### 3. Notifications (Sonner)

```tsx
import { toast } from 'sonner';

// Success
toast.success('Opération réussie', {
  description: 'Les données ont été sauvegardées',
});

// Error
toast.error('Erreur', {
  description: 'Une erreur est survenue',
});

// Info
toast.info('Information', {
  description: 'Nouveau message reçu',
});

// Warning
toast.warning('Attention', {
  description: 'Action requise',
});

// Promise (loading state automatique)
toast.promise(
  fetch('/api/data'),
  {
    loading: 'Chargement...',
    success: 'Données chargées',
    error: 'Erreur de chargement',
  }
);
```

### 4. UserDropdown

```tsx
import { UserDropdown } from '@/presentation/components/layout/UserDropdown';

function Header() {
  return (
    <header>
      <UserDropdown />
    </header>
  );
}
```

## Personnalisation

Tous les composants shadcn/ui dans `ui/` peuvent être personnalisés directement.
Modifiez les fichiers selon vos besoins de style et de comportement.

## Ajout de nouveaux composants shadcn

```bash
npx shadcn@latest add [component-name]
```

Les composants seront automatiquement ajoutés dans `src/presentation/components/ui/`.
