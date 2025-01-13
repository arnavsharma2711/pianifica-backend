import { sendMail } from "../interactor/mailer-interactor";
import config from "config";

export const sendVerifyMailService = async (
  receiver: string,
  verificationToken: string
) => {
  const html = `
    <h1>
      Verify your email
    </h1>
    <p>
      Click the link below to verify your email
        </p>
    <a href="${config.get(
      "serviceUrl"
    )}/verify-email/?token=${verificationToken}">
      Verify Email
    </a>

    <p>
      If you did not request this, please ignore this email.
    </p>

    <p>
      Thanks,
    <br />
      Pianifica Team
    </p>
  `;

  const response = await sendMail(receiver, {
    subject: "Verify your email",
    html,
  });

  return response;
};