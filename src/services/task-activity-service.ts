import { type FilterOptions, getDefaultFilter } from "../lib/filters";
import * as taskActivityModel from "../models/task-activity-model";
import { getExistingTaskById } from "./task-service";

export const createTaskActivity = async ({
  taskId,
  userId,
  actionType,
  actionOn,
  previousValue,
  updatedValue,
}: {
  taskId: number;
  userId: number;
  actionType: string;
  actionOn: string;
  previousValue?: string;
  updatedValue?: string;
}) => {
  return await taskActivityModel.createTaskActivity({
    taskId,
    userId,
    actionType,
    actionOn,
    previousValue,
    updatedValue,
  });
};

export const getTaskActivityByTaskId = async ({
  taskId,
  organizationId,
  filters,
}: {
  taskId: number;
  organizationId: number;
  filters: FilterOptions;
}) => {
  await getExistingTaskById({ id: taskId, organizationId });
  return await taskActivityModel.getTaskActivityByTaskId({
    taskId,
    filters: getDefaultFilter(filters),
  });
};

export const getTaskActivityByTaskIdAndAction = async ({
  taskId,
  actionType,
  actionOn,
}: {
  taskId: number;
  actionType: string;
  actionOn: string;
}) => {
  return await taskActivityModel.getTaskActivityByTaskIdAndAction({
    taskId,
    actionType,
    actionOn,
  });
};
