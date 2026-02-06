import prisma from "@/lib/prisma";

// get skills

export type GetSkillsRequest = {
    userId?: string;
};

export async function getSkills(options: GetSkillsRequest) {
    return prisma.skill.findMany({
        where: {
            userId: options.userId,
        },
    });
}

export type GetSkillsResponse = Awaited<ReturnType<typeof getSkills>>;

// get skill by id

export type GetSkillByIdRequest = {
    id: number;
    userId?: string;
};

export async function getSkillById(options: GetSkillByIdRequest) {
    return prisma.skill.findUnique({
        where: {
            id: options.id,
            userId: options.userId,
        },
    });
}

export type GetSkillByIdResponse = Awaited<ReturnType<typeof getSkillById>>;

// create skill

export type CreateSkillRequest = {
    userId: string;
    title: string;
    description?: string;
};

export async function createSkill(options: CreateSkillRequest) {
    return prisma.skill.create({
        data: options,
    });
}

export type CreateSkillResponse = Awaited<ReturnType<typeof createSkill>>;

// update skill

export type UpdateSkillRequest = Partial<Omit<CreateSkillRequest, 'userId' | 'id'>>;

export async function updateSkill(id: number, options: UpdateSkillRequest) {
    return prisma.skill.update({
        where: {
            id,
        },
        data: options,
    });
}

export type UpdateSkillResponse = Awaited<ReturnType<typeof updateSkill>>;

// delete skill

export type DeleteSkillRequest = {
    id: number;
};

export async function deleteSkill(options: DeleteSkillRequest) {
    return prisma.skill.delete({
        where: {
            id: options.id,
        },
    });
}

export type DeleteSkillResponse = Awaited<ReturnType<typeof deleteSkill>>;

