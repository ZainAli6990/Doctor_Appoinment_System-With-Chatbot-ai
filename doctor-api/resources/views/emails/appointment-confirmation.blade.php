<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Appointment Confirmed</title>
</head>

<body style="margin:0; padding:0; background-color:#f2f0e9; font-family:Arial, Helvetica, sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 15px;">
        <tr>
            <td align="center">

                <table width="600" cellpadding="0" cellspacing="0"
                       style="background:#ffffff; border-radius:10px; overflow:hidden;">

                    <!-- Header -->
                    <tr>
                        <td style="background:#0d9488; padding:25px; text-align:center; color:white;">
                            <h1 style="margin:0; font-size:26px;">
                                Appointment Confirmed
                            </h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding:30px;">

                            <h2 style="margin-top:0; color:#333;">
                                Hello {{ $appointment->user->name ?? 'Patient' }},
                            </h2>

                            <p style="font-size:16px; color:#555; line-height:1.6;">
                                Your appointment has been successfully confirmed by our admin.
                            </p>

                            <!-- Appointment Details -->
                            <h3 style="color:#0d9488;">
                                Appointment Details
                            </h3>

                            <table width="100%" cellpadding="8" cellspacing="0"
                                   style="border-collapse:collapse; font-size:15px;">

                                <tr>
                                    <td><strong>Appointment ID:</strong></td>
                                    <td>{{ $appointment->id }}</td>
                                </tr>

                                <tr>
                                    <td><strong>Date:</strong></td>
                                    <td>{{ $appointment->appointment_date }}</td>
                                </tr>

                                <tr>
                                    <td><strong>Time:</strong></td>
                                    <td>{{ $appointment->appointment_time }}</td>
                                </tr>

                                <tr>
                                    <td><strong>Status:</strong></td>
                                    <td style="color:#0d9488; font-weight:bold;">
                                        {{ $appointment->status }}
                                    </td>
                                </tr>

                            </table>

                            <!-- Doctor Details -->
                            <h3 style="color:#0d9488; margin-top:25px;">
                                Doctor Details
                            </h3>

                            <table width="100%" cellpadding="8" cellspacing="0"
                                   style="border-collapse:collapse; font-size:15px;">

                                <tr>
                                    <td><strong>Doctor:</strong></td>
                                    <td>
                                        Dr. {{ $appointment->doctor->name ?? 'N/A' }}
                                    </td>
                                </tr>

                                <tr>
                                    <td><strong>Specialization:</strong></td>
                                    <td>
                                        {{ $appointment->doctor->specialization->name ?? 'N/A' }}
                                    </td>
                                </tr>

                                <tr>
                                    <td><strong>Consultation Fee:</strong></td>
                                    <td>
                                        {{ $appointment->doctor->consultation_fee ?? 'N/A' }}
                                    </td>
                                </tr>

                            </table>

                            <p style="margin-top:25px; font-size:15px; color:#555; line-height:1.6;">
                                Please make sure you are available at the scheduled date and time.
                            </p>

                            <p style="font-size:15px; color:#555;">
                                Thank you for using our Doctor Appointment System.
                            </p>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background:#f8f8f8; padding:20px; text-align:center; color:#777; font-size:13px;">
                            © {{ date('Y') }} Doctor Appointment System
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>