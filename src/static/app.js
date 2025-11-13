document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      renderActivities(activities);
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Function to render activities on the page
  function renderActivities(activities) {
    const activitiesList = document.getElementById("activities-list");
    activitiesList.innerHTML = "";

    Object.entries(activities).forEach(([name, info]) => {
      const card = document.createElement("div");
      card.className = "activity-card";

      // Build participants HTML with delete icon
      let participantsHTML = "";
      if (info.participants.length > 0) {
        participantsHTML = `<ul class="participants-list no-bullets">` +
          info.participants
            .map(
              (email) =>
                `<li><span class="participant-badge">${email}</span> <button class="delete-participant" title="Remove participant" data-activity="${encodeURIComponent(name)}" data-email="${encodeURIComponent(email)}">&#128465;</button></li>`
            )
            .join("") +
          `</ul>`;
      } else {
        participantsHTML = `<span class="no-participants">No one signed up yet.</span>`;
      }

      card.innerHTML = `
        <h4>${name}</h4>
        <p><strong>Description:</strong> ${info.description}</p>
        <p><strong>Schedule:</strong> ${info.schedule}</p>
        <p><strong>Max Participants:</strong> ${info.max_participants}</p>
        <div class="participants-section">
          <strong>Participants:</strong>
          ${participantsHTML}
        </div>
      `;
      activitiesList.appendChild(card);

      // Add option to select dropdown
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      activitySelect.appendChild(option);
    });

    // Add event listeners for delete buttons
    document.querySelectorAll(".delete-participant").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const activity = decodeURIComponent(btn.getAttribute("data-activity"));
        const email = decodeURIComponent(btn.getAttribute("data-email"));
        if (!confirm(`Remove ${email} from ${activity}?`)) return;
        try {
          const response = await fetch(`/activities/${encodeURIComponent(activity)}/unregister?email=${encodeURIComponent(email)}`, {
            method: "POST",
          });
          if (response.ok) {
            fetchActivities();
          } else {
            const result = await response.json();
            alert(result.detail || "Failed to remove participant.");
          }
        } catch (error) {
          alert("Failed to remove participant. Please try again.");
        }
      });
    });
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Refresh activities list immediately after successful signup
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();

  // Add CSS for no-bullets class and delete button
  const style = document.createElement('style');
  style.innerHTML = `
  .no-bullets {
    list-style: none;
    padding-left: 0;
  }
  .delete-participant {
    background: none;
    border: none;
    color: #c62828;
    font-size: 1.1em;
    margin-left: 8px;
    cursor: pointer;
    vertical-align: middle;
    border-radius: 50%;
    transition: background 0.2s;
  }
  .delete-participant:hover {
    background: #ffebee;
  }
  `;
  document.head.appendChild(style);
});
