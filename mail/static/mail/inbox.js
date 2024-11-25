let currMailBox = "";

document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('#compose-form').addEventListener('submit', (event) => {
    event.preventDefault(); // Σταματάμε την προεπιλεγμένη συμπεριφορά
    send_email(event);
  });

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  currMailBox = mailbox;

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  let url = '/emails/' + mailbox;
  fetch(url).then(response => response.json())
    .then(
      all_emails => {
        all_emails.forEach(element => {
          let email_item = document.createElement('div');
          email_item.className = 'email_item';
          email_item.innerHTML = `
            <div style="display: flex; justify-content: space-between;">
              <strong>${element.sender}</strong>
              <p>${element.subject}</p>
              <p>${element.timestamp}</p>
            </div>
          `;
          email_item.style.backgroundColor = element.read ? 'grey' : 'white';
          email_item.style.border = '2px solid #000';
          email_item.style.paddingTop = '15px';
          email_item.style.paddingInline = '20px';
          email_item.style.margin = '10px';


          console.log("Email ID:", element.id);
          email_item.addEventListener('click', () => show_email(element.id));

          document.querySelector('#emails-view').append(email_item);
          
        });
      } 
    )

}

function send_email(event){
  event.preventDefault(); 
  console.log('============ NA DOULEUEI TWRA AUTO?')
  let recips = document.querySelector('#compose-recipients').value;
  let subj = document.querySelector('#compose-subject').value;
  let content = document.querySelector('#compose-body').value;

  recips = recips.trim();
  subj = subj.trim();
  content = content.trim();

  fetch('/emails', {
    method: 'POST',
    body:JSON.stringify({
      recipients: recips,
      subject: subj,
      body: content
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(response => response.json())
  .then(res => {
    if (res.error){
      alert('Error')
      console.log('============ ERROR')
    }
    else
    {
      alert('Email sent.')
      load_mailbox('sent');
      console.log('============ WORKS')
    }
    console.log(res);
  })
  return false;
}

function show_email(id){
  console.log("Hello, its me")

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  console.log("POIO EINAI TO ID: "+id);
  let url = '/emails/' + id;
  fetch(url)
  .then(response => response.json())
  .then(email => {
    let archivebtn;
    if (!(currMailBox === "sent")){
      if (email.archived){
        archivebtn = '<button id="archive-btn">Unarchive</button>';
      }
      else
      {
        archivebtn = '<button id="archive-btn">Archive</button>';
      }
    } else {
      archivebtn = '<p></p>';
    }
    document.querySelector('#email-view').innerHTML = `
      <p><strong>From:</strong> ${email.sender}</p>
      <p><strong>To:</strong> ${email.recipients}</p>
      <p><strong>Subject:</strong> ${email.subject}</p>
      <p><strong>Timestamp:</strong> ${email.timestamp}</p>
      <button id="reply-btn">Reply</button>
      <hr>
      <p>${email.body}</p>
      ${archivebtn}
    `;

    if (!(currMailBox === "sent")){
      document.querySelector('#archive-btn').addEventListener('click', () =>{
        console.log("DO PRINT: "+email.archived);
        fetch(url, {
          method: 'PUT',
          body: JSON.stringify({
            archived: !email.archived
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        });
        load_mailbox('inbox');
      });

      document.querySelector('#reply-btn').addEventListener('click', () =>{
        console.log("Call the compose to reply...: ");
        compose_email();

        document.querySelector('#compose-recipients').value = email.sender;
        if (email.subject.startsWith("Re:"))
        {
          document.querySelector('#compose-subject').value = email.subject;
        }
        else{
          document.querySelector('#compose-subject').value = "Re: " + email.subject;
        }
        
        document.querySelector('#compose-body').value = "On " + email.timestamp + ", " + email.sender + " wrote: " + email.body;
      });
    }

    fetch(url, {
      method: 'PUT',
      body: JSON.stringify({
        read: true
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  })
}