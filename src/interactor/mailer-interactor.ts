import { create } from "apisauce";
import config from "config";
import logger from "../utils/logger";
import { generateToken } from "../utils/commonUtils";

const mailerService = create({
  baseURL: config.get("microServiceUrls.mailerService"),
  timeout: 10000,
});

export const sendMail = async (
  to: string,
  payload: {
    subject: string;
    html: string;
  },
) => {
  const requestOptions = {
    headers: {
      "x-auth-token": await generateToken(
        { to },
        "5min",
        config.get<string>("microServiceSecrets.mailerService"),
      ),
    },
  };
  interface MailerResponse {
    success: boolean;
    message: string;
  }

  const response = await mailerService.post<MailerResponse>(
    "/send-email",
    payload,
    requestOptions,
  );

  if (!response.ok || !response.data?.success) {
    logger.error(response.data?.message);
  }

  return response;
};
