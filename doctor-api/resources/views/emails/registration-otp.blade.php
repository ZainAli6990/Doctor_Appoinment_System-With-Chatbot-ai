<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Email Verification</title>
</head>

<body style="margin:0;padding:0;background:#f2f0e9;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
        <td align="center">

            <table width="500" cellpadding="0" cellspacing="0"
                   style="background:#ffffff;border-radius:16px;overflow:hidden;">

                <tr>
                    <td align="center"
                        style="background:#0a3e38;padding:30px;">

                        <h2 style="color:#ffffff;margin:0;">
                            SehatCare
                        </h2>

                    </td>
                </tr>

                <tr>
                    <td style="padding:35px;">

                        <h2 style="margin:0 0 15px;color:#12211f;">
                            Verify Your Email
                        </h2>

                        <p style="color:#5b6e6a;font-size:15px;line-height:1.6;">
                            Hello {{ $userName }},
                        </p>

                        <p style="color:#5b6e6a;font-size:15px;line-height:1.6;">
                            Thank you for registering with SehatCare.
                            Use the OTP below to verify your email address.
                        </p>

                        <div style="text-align:center;margin:30px 0;">

                            <div style="
                                display:inline-block;
                                background:#f1f7f5;
                                border:2px dashed #0f5c52;
                                padding:18px 35px;
                                border-radius:12px;
                                font-size:32px;
                                font-weight:700;
                                letter-spacing:8px;
                                color:#0f5c52;
                            ">
                                {{ $otp }}
                            </div>

                        </div>

                        <p style="color:#5b6e6a;font-size:14px;">
                            This OTP will expire in 10 minutes.
                        </p>

                        <p style="color:#5b6e6a;font-size:14px;">
                            If you did not request this registration,
                            you can safely ignore this email.
                        </p>

                    </td>
                </tr>

            </table>

        </td>
    </tr>
</table>

</body>
</html>