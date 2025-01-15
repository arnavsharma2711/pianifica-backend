const NOTIFICATION_TYPE_MESSAGE_MAP: {
  [key: string]: {
    [key: string]: string;
  };
} = {
  Project: {
    Created: "The project <project_name> has been successfully created.",
    Updated: "The project <project_name> has been successfully updated.",
    Assigned:
      "The project <project_name> has been assigned to the team <team_name>.",
    Unassigned:
      "The project <project_name> has been unassigned from the team <team_name>.",
  },
  Team: {
    Created: "The team <team_name> has been successfully created.",
    Added: "You have been added to the team <team_name>.",
    Removed: "You have been removed from the team <team_name>.",
    Promoted:
      "Congratulations! You have been promoted to manager of the team <team_name>.",
    Demoted: "You have been demoted to a member in the team <team_name>.",
  },
  User: {
    Verify: "Please verify your email to continue using our services.",
    Reset: "A password reset request has been triggered for your account.",
  },
};

async function replaceVariables(
  notification: string,
  variables: Record<string, string>,
) {
  return notification.replace(/<[^>]+>/g, (match) => variables[match] || match);
}

export async function getNotificationMessage({
  notifiableType,
  status,
  variables,
}: {
  notifiableType: keyof typeof NOTIFICATION_TYPE_MESSAGE_MAP;
  status: keyof (typeof NOTIFICATION_TYPE_MESSAGE_MAP)[typeof notifiableType];
  variables: Record<string, string>;
}): Promise<string | undefined> {
  return await replaceVariables(
    NOTIFICATION_TYPE_MESSAGE_MAP[notifiableType]?.[status],
    variables,
  );
}
