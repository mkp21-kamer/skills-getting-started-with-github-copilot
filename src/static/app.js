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
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants">
            <p><strong>Current Participants:</strong></p>
            <ul>
              ${details.participants.map(email => `<li>${email}</li>`).join('')}
            </ul>
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Add delete functionality for participants
  function addDeleteFunctionality(activityName, participantEmail, participantElement) {
    const deleteIcon = document.createElement("span");
    deleteIcon.textContent = "✖";
    deleteIcon.className = "delete-icon";
    deleteIcon.addEventListener("click", async () => {
      try {
        const response = await fetch(
          `/activities/${encodeURIComponent(activityName)}/unregister?email=${encodeURIComponent(participantEmail)}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          participantElement.remove();
        } else {
          console.error("Failed to unregister participant:", await response.json());
        }
      } catch (error) {
        console.error("Error unregistering participant:", error);
      }
    });
    participantElement.appendChild(deleteIcon);
  }

  // Function to dynamically update the participant list
  function updateParticipantList(activityName, participantEmail) {
    const activityElement = document.querySelector(`[data-activity-name="${activityName}"]`);
    if (activityElement) {
      const participantsList = activityElement.querySelector(".participants ul");
      const newParticipant = document.createElement("li");
      newParticipant.textContent = participantEmail;
      addDeleteFunctionality(activityName, participantEmail, newParticipant);
      participantsList.appendChild(newParticipant);
    }
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

        // Dynamically update the participant list
        updateParticipantList(activity, email);
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
});
