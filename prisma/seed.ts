import {
  type Prisma,
  PrismaClient,
  type ProjectStatus,
  type TaskPriority,
  type TaskStatus,
  type TaskType,
} from "@prisma/client";
const prisma = new PrismaClient();
import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";

function capitalizeWords(str: string): string {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function deleteAllData() {
  const modelNames = [
    { name: "TaskActivity", hasIdSequence: true },
    { name: "Task", hasIdSequence: true },
    { name: "Notification", hasIdSequence: true },
    { name: "TeamsOnProjects", hasIdSequence: false },
    { name: "Project", hasIdSequence: true },
    { name: "TeamsOnUsers", hasIdSequence: false },
    { name: "Team", hasIdSequence: true },
    { name: "UserToken", hasIdSequence: false },
    { name: "UserRole", hasIdSequence: false },
    { name: "User", hasIdSequence: true },
    { name: "Organization", hasIdSequence: true },
  ];

  for (const modelName of modelNames) {
    try {
      await prisma.$executeRawUnsafe(`DELETE FROM "${modelName.name}";`);
      if (modelName.hasIdSequence) {
        await prisma.$executeRawUnsafe(
          `ALTER SEQUENCE "${modelName.name}_id_seq" RESTART WITH 1;`
        );
      }
      console.log(
        `Cleared data from ${modelName.name}${
          modelName.hasIdSequence ? " and reset id sequence." : "."
        }`
      );
    } catch (error) {
      console.error(`Error clearing data from ${modelName.name}:`, error);
      return false;
    }
  }

  return true;
}

async function createOrganization() {
  const organizations = [
    {
      name: "Pianifica",
      description:
        "Pianifica is a platform that helps you manage your tasks and projects in a simple and efficient way.",
      address: "123 Main St, Anytown, USA",
      website: "https://pianifica.com",
      email: "info@pianifica.com",
      phone: "1234567890",
    },
    {
      name: "Ance Inc.",
      description:
        "Ance is a platform that helps you manage your tasks and projects in a simple and efficient way.",
      address: "123 Main St, Anytown, USA",
      website: "https://ance.com",
      email: "info@ance.com",
      phone: "1234567890",
    },
  ];

  await prisma.organization.createMany({
    data: organizations,
  });
}

async function createUsers() {
  const users: Prisma.UserCreateManyInput[] = [
    {
      organizationId: 1,
      email: "arnavsharma2711@gmail.com",
      password: bcrypt.hashSync("password", 10),
      username: "arnav_sharma",
      firstName: "Arnav",
      lastName: "Sharma",
      designation: "Founder",
      phone: "1234567890",
      profilePictureUrl: faker.image.avatar(),
      verifiedAt: new Date(),
    },
  ];

  for (let i = 0; i < 10; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const username = faker.internet
      .username({ firstName, lastName })
      .toLowerCase();
    const email = faker.internet.email({ firstName, lastName });

    users.push({
      organizationId: 2,
      email,
      password: bcrypt.hashSync("password", 10),
      username,
      firstName,
      lastName,
      designation: faker.person.jobTitle(),
      profilePictureUrl: faker.image.avatar(),
      phone: faker.phone.number(),
      verifiedAt: new Date(),
    });
  }

  await prisma.user.createMany({
    data: users,
  });

  const userRoles: Prisma.UserRoleCreateManyInput[] = [
    {
      userId: 1,
      role: "SUPER_ADMIN",
    },
    {
      userId: 2,
      role: "ORG_SUPER_ADMIN",
    },
    {
      userId: 3,
      role: "ORG_ADMIN",
    },
  ];

  for (let i = 4; i <= 11; i++) {
    userRoles.push({
      userId: i,
      role: "ORG_MEMBER",
    });
  }

  await prisma.userRole.createMany({
    data: userRoles,
  });
}

async function createTeams() {
  const teams: Prisma.TeamCreateManyInput[] = [];

  for (let i = 1; i <= 10; i++) {
    teams.push({
      name: capitalizeWords(
        `${faker.animal.type()} ${faker.company.buzzNoun()}`
      ),
      organizationId: 2,
      description: faker.lorem.lines({ min: 1, max: 3 }),
    });
  }

  await prisma.team.createMany({
    data: teams,
  });

  const teamsOnUsers: Prisma.TeamsOnUsersCreateManyInput[] = [];

  for (let i = 1; i <= 10; i++) {
    for (let j = 1; j <= 10; j++) {
      const skip = Math.random() < 0.6;
      if (skip && i !== j) {
        continue;
      }
      teamsOnUsers.push({
        teamId: i,
        userId: j + 1,
        role: i === j ? "MANAGER" : "MEMBER",
      });
    }
  }

  await prisma.teamsOnUsers.createMany({
    data: teamsOnUsers,
  });
}

async function createProjects() {
  const projectStatuses = ["ACTIVE", "BLOCKED", "ARCHIVED", "COMPLETED"];
  const projects: Prisma.ProjectCreateManyInput[] = [];

  for (let i = 0; i < 10; i++) {
    const status = i < projectStatuses.length ? projectStatuses[i] : "ACTIVE";
    projects.push({
      name: capitalizeWords(faker.company.catchPhrase()),
      organizationId: 2,
      description: faker.lorem.lines({ min: 3, max: 5 }),
      budget: faker.number.int({ min: 5000, max: 25000, multipleOf: 5000 }),
      status: status as ProjectStatus,
      createdBy: i % 2 === 0 ? 2 : 3,
    });
  }

  await prisma.project.createMany({
    data: projects,
  });

  const teamsOnProjects: Prisma.TeamsOnProjectsCreateManyInput[] = [];

  for (let i = 1; i <= 10; i++) {
    teamsOnProjects.push({
      teamId: i,
      projectId: i,
    });
  }
  await prisma.teamsOnProjects.createMany({
    data: teamsOnProjects,
  });
}

async function createTasks() {
  const tasks: Prisma.TaskCreateManyInput[] = [];
  const taskTypes = ["FEATURE", "IMPROVEMENT", "BUG"];
  const taskPriorities = ["BACKLOG", "LOW", "MEDIUM", "HIGH", "URGENT"];
  const taskStatuses = ["TODO", "IN_PROGRESS", "UNDER_REVIEW", "RELEASE_READY"];
  for (let i = 1; i <= 10; i++) {
    for (let j = 1; j <= getRandomNumber(22, 30); j++) {
      tasks.push({
        projectId: i,
        authorId: getRandomNumber(2, 11),
        title: capitalizeWords(faker.lorem.sentence()),
        type: taskTypes[getRandomNumber(0, 2)] as TaskType,
        summary: faker.lorem.sentence({ min: 4, max: 10 }),
        status: taskStatuses[getRandomNumber(0, 3)] as TaskStatus,
        priority: taskPriorities[getRandomNumber(0, 4)] as TaskPriority,
        dueDate: faker.date.soon(),
        assigneeId: getRandomNumber(2, 11),
      });
    }
  }

  await prisma.task.createMany({
    data: tasks,
  });
}

async function main() {
  const deletedDataSuccessfully = await deleteAllData();
  if (!deletedDataSuccessfully) {
    console.log("Failed to delete all data");
    return;
  }
  await createOrganization();
  await createUsers();
  await createTeams();
  await createProjects();
  await createTasks();
}

main();
