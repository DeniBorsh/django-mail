document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function view_email(id) {
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#details-view').style.display = 'block';

    document.querySelector('#details-view').innerHTML = `
      <ul class="list-group">
        <li class="list-group-item"><strong>From: </strong>${email.sender}</li>
        <li class="list-group-item"><strong>To: </strong>${email.recipients}</li>
        <li class="list-group-item"><strong>Subject: </strong>${email.subject}</li>
        <li class="list-group-item"><strong>Timestamp: </strong>${email.timestamp}</li>
        <li class="list-group-item">${email.body}</li>
      </ul>
    `;

    if(!email.read) {
      fetch(`/emails/${email.id}`, {
        method: "PUT",
        body: JSON.stringify({
          read: true,
        })
      })
      
    }

    const button = document.createElement("button");
    button.innerHTML = email.archived ? "unarchive": "archive";
    button.className = email.archived ? "btn btn-success": "btn btn-danger";
    button.addEventListener('click', function() {
      fetch(`/emails/${email.id}`, {
        method: "PUT",
        body: JSON.stringify({
          archived: !email.archived,
        })
      })
      .then(() => load_mailbox("archive"));
    });
    document.querySelector("#details-view").append(button);

    const reply = document.createElement("button");
    reply.innerHTML = "Reply";
    reply.className = "btn btn-info";

    reply.addEventListener('click', () => {
      compose_email();
      let subject = email.subject;
      if(subject.split(" ",1)[0] != "Re:") {
        subject = "Re: " + email.subject;
      }
      document.querySelector('#compose-recipients').value = email.sender;
      document.querySelector('#compose-subject').value = subject;
      document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote ${email.body}`;
    });

    
    document.querySelector("#details-view").append(reply);
  });

  
}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  
  document.querySelector('#details-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';


  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

function send_email(event) {
  event.preventDefault();

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent');
  });
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  
  document.querySelector('#details-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    emails.forEach(email => {
      const element = document.createElement('div');
      element.className = "list-group-item";

      element.innerHTML = `
        <h6>Sender: ${email.sender}</h6>
        <h5>Subject: ${email.subject}</h5>
        <p>${email.timestamp}</p>
      `;

      element.className = email.read ? "read": "unread";
      element.addEventListener('click', function() {
        view_email(email.id);
      });
      document.querySelector("#emails-view").append(element);
    })
  });
}







