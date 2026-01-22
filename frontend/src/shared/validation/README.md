# 🛡️ Validation avec Zod

Ce dossier contient tous les schémas de validation Zod pour les formulaires de l'application.

## 📋 Structure

```
shared/validation/
├── index.ts                 # Export centralisé
├── task.schema.ts          # Schémas pour les tâches
└── scrum-note.schema.ts    # Schémas pour les notes scrum
```

## 🎯 Utilisation

### Dans un formulaire React Hook Form

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTaskSchema, type CreateTaskFormData } from '@/shared/validation';

function MyForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      deadline: '',
    },
  });

  const onSubmit = async (data: CreateTaskFormData) => {
    // Les données sont déjà validées ici
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Titre"
        error={errors.title?.message}
        {...register('title')}
      />
      <Button type="submit">Soumettre</Button>
    </form>
  );
}
```

### Validation manuelle

```tsx
import { createTaskSchema } from '@/shared/validation';

const result = createTaskSchema.safeParse({
  title: 'Ma tâche',
  description: 'Description',
});

if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error.errors);
}
```

## 📝 Schémas disponibles

### Tâches

#### `createTaskSchema`
- **title**: string (1-255 caractères, requis)
- **description**: string (1-2000 caractères, requis)
- **deadline**: string (date ISO, optionnel, ne peut pas être dans le passé)

```tsx
import { createTaskSchema, type CreateTaskFormData } from '@/shared/validation';
```

#### `updateTaskSchema`
- Même structure que `createTaskSchema` mais tous les champs sont optionnels

### Notes Scrum

#### `createScrumNoteSchema`
- **whatIDid**: string (1-2000 caractères, requis)
- **nextSteps**: string (1-2000 caractères, requis)
- **blockers**: string (0-2000 caractères, optionnel)

```tsx
import { createScrumNoteSchema, type CreateScrumNoteFormData } from '@/shared/validation';
```

#### `updateScrumNoteSchema`
- Même structure que `createScrumNoteSchema` mais tous les champs sont optionnels

## ✅ Règles de validation

### Validation de date (deadline)

```typescript
deadline: z
  .string()
  .optional()
  .refine((date) => {
    if (!date) return true;
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  }, 'La date limite ne peut pas être dans le passé')
```

### Validation de longueur

```typescript
title: z
  .string()
  .min(1, 'Le titre est requis')
  .max(255, 'Le titre ne peut pas dépasser 255 caractères')
```

## 🎨 Composants UI avec validation

### Input avec erreur

```tsx
<Input
  label="Titre"
  placeholder="Entrez le titre"
  required
  error={errors.title?.message}
  {...register('title')}
/>
```

### Textarea avec erreur

```tsx
<Textarea
  label="Description"
  placeholder="Entrez la description"
  required
  error={errors.description?.message}
  {...register('description')}
/>
```

## 🔧 Personnalisation

### Ajouter un nouveau schéma

1. Créer un fichier `monentite.schema.ts` :

```typescript
import { z } from 'zod';

export const createMonEntiteSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
});

export type CreateMonEntiteFormData = z.infer<typeof createMonEntiteSchema>;
```

2. L'exporter dans `index.ts` :

```typescript
export * from './monentite.schema';
```

### Ajouter une validation personnalisée

```typescript
deadline: z
  .string()
  .refine(
    (date) => {
      // Votre logique de validation
      return true;
    },
    'Message d'erreur personnalisé'
  )
```

## 🚨 Messages d'erreur

Tous les messages d'erreur sont en français et sont affichés directement sous les champs de formulaire.

### Erreurs courantes

- **Champ vide**: "Le [champ] est requis"
- **Trop long**: "Le texte ne peut pas dépasser X caractères"
- **Date passée**: "La date limite ne peut pas être dans le passé"

## 📚 Ressources

- [Documentation Zod](https://zod.dev)
- [React Hook Form avec Zod](https://react-hook-form.com/get-started#SchemaValidation)
- [Composants UI](../presentation/components/README.md)
