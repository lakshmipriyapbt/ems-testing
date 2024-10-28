<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Experience Certificate</title>
    <style>
        body {
            position: relative;
        }
         .watermark {
                          position: fixed;
                          top: 25%;
                          left: 20%;
                          transform: translate(-50%, -50%) rotate(30deg);
                          z-index: -1;
                          width: 400px;
                          height: auto;
                          text-align: center;
                      }

                      .watermark img {
                          width: 100%;
                          height: auto;
                          opacity: 0.05;
                      }
        .header {
            text-align: center;
            margin-top: 20px;
        }
       .logo {
            text-align: right;
            background-size: contain;
       }
        .date {
            text-align: left;
            padding: 20px;
         }
        .title {
            margin-top: 30px;
            text-align: center;
        }
        .content {
            margin: 20px;
        }
        .responsibilities {
            margin-top: 20px;
            list-style-type: disc;
            margin-left: 40px;
        }
    </style>
</head>
<body>
   <div>


    <div class="logo">
         <img style="height: 90px; width: 200px;" src="${company[0].imageFile}" alt="Company Logo" />
    </div>

    <div class="header"><b>EXPERIENCE CERTIFICATE</b></div>
    <div class="date">Date: <b>${request.date}</b></div>
    <div class="title"><b>TO WHOMSOEVER IT MAY CONCERN</b></div>
    <div class="content">
        <div class="watermark">
            <img src="${blurredImage}" alt="Blurred Company Logo" />
        </div>
        <p>This letter certifies that <b>${employee.firstName} ${employee.lastName}</b> was a valued member of our team at ${company[0].companyName}.
         as a <#if employee.designationName?has_content>
                   as a <b>${employee.designationName}.</b>
              </#if> in the <#if employee.designationName?has_content> ${employee.departmentName}
                                            </#if> Department from ${employee.dateOfHiring} to ${request.date}.
        </p>
        <p>During ${employee.firstName} ${employee.lastName}’s employment, he exhibited exceptional proficiency in coding and <#if employee.designationName?has_content>
                                                                                                                                                  as a ${employee.designationName}.
                                                                                                                                             </#if>. He actively participated in multiple projects, demonstrating strong problem-solving abilities and meticulous attention to detail. ${employee.firstName} ${employee.lastName} consistently met project deadlines and collaborated seamlessly with team members to ensure the delivery of high-quality software solutions.</p>

        <p>${employee.firstName} ${employee.lastName}’s dedication and hard work significantly contributed to the success of our projects. His innovative ideas and proactive approach were instrumental in overcoming challenges and achieving project objectives.</p>
        <p>We commend ${employee.firstName} ${employee.lastName} for his outstanding performance and professionalism throughout his tenure with ${company[0].companyName}.. His contributions have been invaluable to our team, and we have no doubt that he will continue to excel in his future endeavors.</p>
        <p>Sincerely,</p>

        <div>For ${company[0].companyName}</div>
        <div style="margin-top:100px">Authorized Signature</div>
    </div>
    </div>
</body>
</html>
