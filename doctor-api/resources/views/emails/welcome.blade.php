x<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to SehatCare</title>
</head>

<body style="margin:0; padding:0; background-color:#f2f0e9; font-family:Arial, Helvetica, sans-serif;">

    <table role="presentation"
           width="100%"
           cellpadding="0"
           cellspacing="0"
           style="background-color:#f2f0e9; padding:32px 0;">

        <tr>
            <td align="center">

                <table role="presentation"
                       width="480"
                       cellpadding="0"
                       cellspacing="0"
                       style="background-color:#ffffff; border-radius:16px; overflow:hidden;">

                    <!-- Logo Header -->
                    <tr>
                        <td align="center"
                            style="background-color:#0a3e38; padding:28px 32px;">

                            @php
                                // Safe check: agar logo file exist nahi karti,
                                // to mail crash nahi hogi - bas image skip ho jayegi.
                                $logoPath = public_path('images/logo.png');
                            @endphp

                            @if(file_exists($logoPath))
                                <img
                                    src="{{ $message->embed($logoPath) }}"
                                    alt="SehatCare"
                                    width="160"
                                    style="display:block;
                                           width:160px;
                                           max-width:100%;
                                           height:auto;
                                           border:0;
                                           outline:none;
                                           text-decoration:none;"
                                >
                            @else
                                <span style="color:#ffffff; font-size:20px; font-weight:700; letter-spacing:0.5px;">
                                    SehatCare
                                </span>
                            @endif

                        </td>
                    </tr>

                    <!-- Email Content -->
                    <tr>
                        <td style="padding:32px;">

                            <h2 style="color:#12211f; margin:0 0 16px 0;">
                                Welcome, {{ $user->name }}!
                            </h2>

                            <p style="color:#5b6e6a;
                                      font-size:15px;
                                      line-height:1.6;
                                      margin:0 0 16px 0;">

                                Thank you for creating your SehatCare account.
                                You can now book appointments with our doctors,
                                track your appointment history, and manage your
                                health profile — all in one place.

                            </p>

                            <p style="color:#5b6e6a;
                                      font-size:15px;
                                      line-height:1.6;
                                      margin:0 0 24px 0;">

                                Your registered email:

                                <strong style="color:#12211f;">
                                    {{ $user->email }}
                                </strong>

                            </p>

                            <a href="{{ config('app.frontend_url', 'http://localhost:5173') }}/login"
                               style="display:inline-block;
                                      background-color:#0f5c52;
                                      color:#ffffff;
                                      text-decoration:none;
                                      padding:12px 24px;
                                      border-radius:10px;
                                      font-weight:600;
                                      font-size:14px;">

                                Go to your dashboard

                            </a>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding:20px 32px;
                                   background-color:#f2f0e9;">

                            <p style="color:#5b6e6a;
                                      font-size:12px;
                                      margin:0;">

                                If you did not create this account,
                                please ignore this email.

                            </p>

                        </td>
                    </tr>

                </table>

            </td>
        </tr>

    </table>

</body>
</html>
