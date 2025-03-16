let currMailBox = "";

document.addEventListener("DOMContentLoaded", function () {
  // Use buttons to toggle between views
  document
    .querySelector("#inbox")
    .addEventListener("click", () => load_mailbox("inbox"));
  document
    .querySelector("#sent")
    .addEventListener("click", () => load_mailbox("sent"));
  document
    .querySelector("#archived")
    .addEventListener("click", () => load_mailbox("archive"));
  document.querySelector("#compose").addEventListener("click", compose_email);

  document
    .querySelector("#compose-form")
    .addEventListener("submit", (event) => {
      event.preventDefault();
      send_email(event);
    });

  // By default, load the inbox
  load_mailbox("inbox");
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#email-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";
}

function load_mailbox(mailbox) {
  currMailBox = mailbox;

  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#email-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "none";

  // Show the mailbox name
  document.querySelector("#emails-view").innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;

  all_emails = [];
  let url = "/emails/" + mailbox;
  fetch(url)
    .then((response) => response.json())
    .then((all_emails) => {
      if (all_emails.length === 0) {
        document.querySelector("#emails-view").innerHTML += `
          <p class="color-white no-emails">
            This mailbox is empty.
          </p>`;
        return;
      }

      all_emails.forEach((element) => {
        let email_item = document.createElement("div");
        email_item.className = "email_item";
        email_item.innerHTML = `
            <div style="display: flex; justify-content: space-between; gap: 4px">
              <strong>${element.sender}</strong>
              <p>${element.subject}</p>
              <p>${element.timestamp}</p>
            </div>
          `;
        email_item.style.backgroundColor = element.read ? "#adb5bd" : "#edddd4";
        email_item.style.color = "#197278";
        email_item.style.paddingTop = "15px";
        email_item.style.borderRadius = "20px";
        email_item.style.paddingInline = "20px";
        email_item.style.marginTop = "12px";

        email_item.addEventListener("click", () => show_email(element.id));

        document.querySelector("#emails-view").append(email_item);
      });
    });
}

function send_email(event) {
  event.preventDefault();
  let recips = document.querySelector("#compose-recipients").value;
  let subj = document.querySelector("#compose-subject").value;
  let content = document.querySelector("#compose-body").value;

  recips = recips.trim();
  subj = subj.trim();
  content = content.trim();

  if (recips) {
    fetch("/emails", {
      method: "POST",
      body: JSON.stringify({
        recipients: recips,
        subject: subj,
        body: content,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((res) => {
        if (res.error) {
          alert("Error");
          console.log("ERROR");
        } else {
          alert("Email sent successfully.");
          load_mailbox("sent");
        }
        console.log(res);
      });
  } else {
    alert("At least one valid recipient required.");
  }

  return false;
}

function show_email(id) {
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#email-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";

  let url = "/emails/" + id;
  fetch(url)
    .then((response) => response.json())
    .then((email) => {
      let archivebtn;
      let replybtn;
      if (!(currMailBox === "sent")) {
        if (email.archived) {
          archivebtn =
            '<button class="btn-sm-archive" id="archive-btn">Unarchive</button>';
        } else {
          archivebtn =
            '<button class="btn-sm-archive" id="archive-btn">Archive</button>';
        }
        replybtn = '<button class="btn-sm" id="reply-btn">Reply</button>';
      } else {
        archivebtn = "<p></p>";
        replybtn = "<p></p>";
      }
      document.querySelector("#email-view").innerHTML = `
      <p class="color-white"><strong>From:</strong> ${email.sender}</p>
      <!--<p class="color-white"><strong>To:</strong> ${email.recipients}</p>-->
      <br />
      <p class="color-white email-subj"><strong>${email.subject}</strong></p>
      <p class="color-white email-tmstp">${email.timestamp}</p>
      <hr>
      <p class="color-white">${email.body}</p>
      ${replybtn}${archivebtn}
    `;

      if (!(currMailBox === "sent")) {
        document.querySelector("#archive-btn").addEventListener("click", () => {
          fetch(url, {
            method: "PUT",
            body: JSON.stringify({
              archived: !email.archived,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          });
          load_mailbox("inbox");
        });

        document.querySelector("#reply-btn").addEventListener("click", () => {
          compose_email();

          document.querySelector("#compose-recipients").value = email.sender;
          if (email.subject.startsWith("Re:")) {
            document.querySelector("#compose-subject").value = email.subject;
          } else {
            document.querySelector("#compose-subject").value =
              "Re: " + email.subject;
          }

          document.querySelector("#compose-body").value =
            "On " +
            email.timestamp +
            ", " +
            email.sender +
            " wrote: " +
            email.body;
        });
      }

      fetch(url, {
        method: "PUT",
        body: JSON.stringify({
          read: true,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    });
}
