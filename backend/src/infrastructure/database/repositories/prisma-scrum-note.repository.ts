import { IScrumNoteInteractor } from "@/core/interactors";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { ScrumNote } from "@/core/domain/entities/scrum-note.entity";
import { ScrumNotePersistenceMapper } from "../mappers";

/**
 * Implémentation Prisma du repository ScrumNote
 */
@Injectable()
export class PrismaScrumNoteRepository implements IScrumNoteInteractor {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Récupère une note de scrum par son ID
     */
    async findById(id: string): Promise<ScrumNote | null> {
        const prismaScrumNote = await this.prisma.scrumNote.findUnique({
            where: { id },
        });

        if (!prismaScrumNote) {
            return null;
        }

        return ScrumNotePersistenceMapper.toDomain(prismaScrumNote);
    }

    /**
     * Récupère toutes les notes de scrum d'un utilisateur
     */
    async findByUserId(userId: string): Promise<ScrumNote[]> {
        const prismaScrumNotes = await this.prisma.scrumNote.findMany({
            where: {
                userId: userId,
            },
            orderBy: {
                date: 'desc',
            },
        });

        return ScrumNotePersistenceMapper.toDomainList(prismaScrumNotes);
    }

    /**
     * Récupère les notes de scrum pour une date donnée
     */
    async findByDate(date: Date): Promise<ScrumNote[]> {
        // Normaliser la date au début de la journée
        const normalizedDate = new Date(date);
        normalizedDate.setHours(0, 0, 0, 0);

        const prismaScrumNotes = await this.prisma.scrumNote.findMany({
            where: {
                date: normalizedDate,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        return ScrumNotePersistenceMapper.toDomainList(prismaScrumNotes);
    }

    /**
     * Récupère les notes d'aujourd'hui
     */
    async findToday(): Promise<ScrumNote[]> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return this.findByDate(today);
    }

    /**
     * Récupère la note d'un utilisateur pour une date donnée
     */
    async findByUserAndDate(
        userId: string,
        date: Date,
    ): Promise<ScrumNote | null> {
        // Normaliser la date au début de la journée
        const normalizedDate = new Date(date);
        normalizedDate.setHours(0, 0, 0, 0);

        const prismaScrumNote = await this.prisma.scrumNote.findUnique({
            where: {
                userId_date: {
                    userId: userId,
                    date: normalizedDate,
                },
            },
        });

        if (!prismaScrumNote) {
            return null;
        }

        return ScrumNotePersistenceMapper.toDomain(prismaScrumNote);
    }

    /**
     * Récupère les notes d'un utilisateur pour une période
     */
    async findByUserAndDateRange(
        userId: string,
        startDate: Date,
        endDate: Date,
    ): Promise<ScrumNote[]> {
        // Normaliser les dates
        const normalizedStartDate = new Date(startDate);
        normalizedStartDate.setHours(0, 0, 0, 0);

        const normalizedEndDate = new Date(endDate);
        normalizedEndDate.setHours(23, 59, 59, 999);

        const prismaScrumNotes = await this.prisma.scrumNote.findMany({
            where: {
                userId: userId,
                date: {
                    gte: normalizedStartDate,
                    lte: normalizedEndDate,
                },
            },
            orderBy: {
                date: 'desc',
            },
        });

        return ScrumNotePersistenceMapper.toDomainList(prismaScrumNotes);
    }

    /**
     * Sauvegarde une note de scrum (création ou mise à jour)
     */
    async save(note: ScrumNote): Promise<ScrumNote> {
        // Vérifier si la note existe déjà
        const exists = await this.exists(note.id);

        if (exists) {
            // Mise à jour
            const updated = await this.prisma.scrumNote.update({
                where: { id: note.id },
                data: ScrumNotePersistenceMapper.toPrismaUpdate(note),
            });

            return ScrumNotePersistenceMapper.toDomain(updated);
        } else {
            // Création
            const created = await this.prisma.scrumNote.create({
                data: ScrumNotePersistenceMapper.toPrismaCreate(note),
            });

            return ScrumNotePersistenceMapper.toDomain(created);
        }
    }

    /**
     * Supprime une note de scrum
     */
    async delete(id: string): Promise<void> {
        await this.prisma.scrumNote.delete({
            where: { id },
        });
    }

    /**
     * Vérifie si une note existe
     */
    async exists(id: string): Promise<boolean> {
        const count = await this.prisma.scrumNote.count({
            where: { id },
        });

        return count > 0;
    }
}