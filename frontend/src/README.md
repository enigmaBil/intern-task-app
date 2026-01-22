# Clean Architecture - Frontend

Cette architecture suit les principes de la Clean Architecture pour garantir une séparation claire des responsabilités et une maintenabilité optimale.

## Structure

```
src/
├── core/                      # Logique métier pure
│   ├── domain/               # Entités, enums, exceptions
│   │   ├── entities/         # User, Task, ScrumNote
│   │   ├── enums/            # TaskStatus, TaskPriority, UserRole
│   │   ├── exceptions/       # DomainException, etc.
│   │   └── repositories/     # Interfaces de repositories
│   ├── use-cases/            # Cas d'utilisation métier
│   │   ├── user/
│   │   ├── task/
│   │   └── scrum-note/
│   └── interactors/          # Orchestration des use-cases
│
├── infrastructure/           # Implémentations techniques
│   ├── http/                 # Client HTTP (fetch wrapper)
│   ├── repositories/         # Implémentations concrètes
│   ├── auth/                 # Services d'authentification
│   └── storage/              # LocalStorage, SessionStorage
│
├── presentation/             # Interface utilisateur
│   ├── components/           # Composants React
│   │   ├── ui/              # Composants shadcn/ui
│   │   ├── user/
│   │   ├── task/
│   │   ├── scrum-note/
│   │   └── shared/
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Pages spécifiques
│   └── styles/              # Styles
│
└── shared/                  # Code partagé
    ├── types/               # Types TypeScript
    ├── utils/               # Fonctions utilitaires
    └── constants/           # Constantes

app/                         # Routes Next.js (App Router)
```

## Principes

### 1. Dépendances
Les dépendances vont toujours vers l'intérieur :
- **Presentation** → **Core** ← **Infrastructure**
- Le **Core** ne dépend de rien d'autre
- L'**Infrastructure** implémente les interfaces du **Core**

### 2. Utilisation

#### Dans un composant React :
```typescript
import { taskInteractor } from '@/core/interactors';

// Récupérer toutes les tâches
const tasks = await taskInteractor.getAllTasks.execute();

// Créer une tâche
const newTask = await taskInteractor.createTask.execute({
  title: 'Ma tâche',
  description: 'Description',
  status: TaskStatus.TODO,
  priority: TaskPriority.MEDIUM,
});
```

#### Dans un custom hook :
```typescript
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  
  useEffect(() => {
    taskInteractor.getAllTasks.execute()
      .then(setTasks)
      .catch(handleError);
  }, []);
  
  return { tasks };
}
```

### 3. Avantages

- ✅ **Testabilité** : Chaque couche peut être testée isolément
- ✅ **Maintenabilité** : Code organisé et facile à comprendre
- ✅ **Indépendance** : Le métier ne dépend pas du framework
- ✅ **Scalabilité** : Facile d'ajouter de nouvelles fonctionnalités
- ✅ **Réutilisabilité** : Les use-cases peuvent être partagés

## HTTP Client

Le client HTTP utilise `fetch` natif avec :
- Gestion automatique des tokens
- Transformation des erreurs en exceptions métier
- Timeout configurable
- Parsing JSON automatique

## Interactors

Les interactors sont des singletons qui regroupent tous les use-cases d'un domaine :
- `taskInteractor` : Gestion des tâches
- `userInteractor` : Gestion des utilisateurs
- `scrumNoteInteractor` : Gestion des notes scrum
