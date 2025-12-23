"use client";

import { useMemo, useState } from "react";
import styles from "./styles/page.module.css";
import {
  appointments,
  patients,
  dailyTasks,
  type Appointment,
  type Patient
} from "./lib/data";
import { generateAssistantResponse } from "./lib/assistant";

type Message = {
  role: "assistant" | "user";
  text: string;
  tone?: "warm" | "professional" | "quick";
};

const initialAssistant = generateAssistantResponse("");

const quickPrompts = [
  "Give me today's chairside briefing",
  "Any patients I should personally call?",
  "Draft a post-op care text for Ava Patel",
  "Which insurance claims are outstanding?"
];

function formatDateTimeRange(appt: Appointment) {
  const start = new Date(appt.start);
  const end = new Date(appt.end);
  return `${start.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric"
  })} • ${start.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit"
  })} – ${end.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit"
  })}`;
}

function getPatient(id: string): Patient | undefined {
  return patients.find((patient) => patient.id === id);
}

const sortedAppointments = [...appointments].sort(
  (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
);

const topPatients = patients.slice(0, 3);

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: initialAssistant.reply,
      tone: initialAssistant.tone
    }
  ]);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState(initialAssistant.suggestions);
  const [highlightedAppointments, setHighlightedAppointments] = useState(
    initialAssistant.highlightedAppointments
  );

  const outstandingTasks = useMemo(
    () =>
      dailyTasks.slice().sort(
        (a, b) => new Date(a.due).getTime() - new Date(b.due).getTime()
      ),
    []
  );

  const handleSend = (content: string) => {
    if (!content.trim()) {
      return;
    }

    setMessages((prev) => [...prev, { role: "user", text: content }]);

    const response = generateAssistantResponse(content);

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        text: response.reply,
        tone: response.tone
      }
    ]);
    setSuggestions(response.suggestions);
    setHighlightedAppointments(response.highlightedAppointments);
    setInput("");
  };

  return (
    <main className={styles.page}>
      <section className={`${styles.hero} card`}>
        <div className={styles.heroHeader}>
          <h1 className={`${styles.heroTitle} gradient-text`}>
            Pearl, your dental studio assistant
          </h1>
          <span className={styles.heroBadge}>
            Synchronized with Opus Dental Cloud
          </span>
        </div>
        <p className={styles.heroSubtitle}>
          Streamline schedules, stay ahead of patient needs, and keep your chair
          humming. Pearl tracks priorities, drafts patient outreach, and keeps
          your team aligned without missing a beat.
        </p>
        <div className={styles.pillList}>
          <span className={styles.pill}>Real-time scheduling</span>
          <span className={styles.pill}>Patient insights</span>
          <span className={styles.pill}>Insurance follow-ups</span>
          <span className={styles.pill}>Chairside prep</span>
        </div>
      </section>

      <div className={styles.contentGrid}>
        <aside className={styles.sidebar}>
          <div className={`${styles.card} card`}>
            <h2 className={styles.cardTitle}>Today&apos;s Highlights</h2>
            <div className={styles.highlights}>
              {highlightedAppointments.length ? (
                highlightedAppointments.map((appt) => {
                  const patient = getPatient(appt.patientId);
                  return (
                    <div key={appt.id} className={styles.highlightItem}>
                      <span className={styles.highlightTitle}>
                        {patient?.name ?? "Patient"} · {appt.type}
                      </span>
                      <span className={styles.highlightDescription}>
                        {formatDateTimeRange(appt)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className={styles.highlightItem}>
                  <span className={styles.highlightTitle}>
                    You&apos;re all clear!
                  </span>
                  <span className={styles.highlightDescription}>
                    No priority visits selected right now—ask Pearl for a fresh
                    briefing anytime.
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className={`${styles.card} card`}>
            <h2 className={styles.cardTitle}>Focus Patients</h2>
            <div className={styles.appointmentList}>
              {topPatients.map((patient) => (
                <div key={patient.id} className={styles.appointmentCard}>
                  <span className={styles.appointmentTitle}>
                    {patient.name}
                  </span>
                  <span className={styles.appointmentMeta}>
                    Last seen{" "}
                    {new Date(patient.lastVisit).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric"
                    })}
                    {patient.nextVisit
                      ? ` · Next visit ${new Date(
                          patient.nextVisit
                        ).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric"
                        })}`
                      : " · No visit scheduled"}
                  </span>
                  <span className={styles.highlightDescription}>
                    {patient.primaryConcern}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className={`${styles.card} card`}>
            <h2 className={styles.cardTitle}>Action Items</h2>
            <div className={styles.appointmentList}>
              {outstandingTasks.map((task) => (
                <div key={task.id} className={styles.appointmentCard}>
                  <span className={styles.appointmentTitle}>{task.description}</span>
                  <span className={styles.appointmentMeta}>
                    Due {new Date(task.due).toLocaleTimeString(undefined, {
                      hour: "numeric",
                      minute: "2-digit"
                    })}{" "}
                    · {task.priority.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className={styles.chat}>
          <header className={styles.chatHeader}>
            <div>
              <h2 className={styles.chatTitle}>Command Center</h2>
              <p className={styles.sectionLabel}>
                Direct Pearl to prep patients, schedule chair time, or compose
                outreach.
              </p>
            </div>
          </header>

          <div className={styles.conversation}>
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`${styles.bubble} ${
                  message.role === "assistant"
                    ? styles.bubbleAssistant
                    : styles.bubbleUser
                }`}
              >
                {message.text}
              </div>
            ))}
          </div>

          <div className={styles.actionChips}>
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className={styles.chip}
                onClick={() => handleSend(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>

          <div className={styles.actionChips}>
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className={styles.chip}
                onClick={() => handleSend(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>

          <form
            className={styles.inputBar}
            onSubmit={(event) => {
              event.preventDefault();
              handleSend(input);
            }}
          >
            <input
              className={styles.input}
              placeholder="Ask Pearl to handle a task or prep for a patient..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
            <button
              className={styles.sendButton}
              type="submit"
              disabled={!input.trim()}
            >
              Send
            </button>
          </form>
        </section>
      </div>

      <section className={`${styles.card} card`}>
        <h2 className={styles.cardTitle}>Upcoming Chairs</h2>
        <div className={styles.appointmentList}>
          {sortedAppointments.map((appt) => {
            const patient = getPatient(appt.patientId);
            return (
              <div key={appt.id} className={styles.appointmentCard}>
                <span className={styles.appointmentTitle}>
                  {patient?.name ?? "Patient"} · {appt.type}
                </span>
                <span className={styles.appointmentMeta}>
                  {formatDateTimeRange(appt)}
                </span>
                <span className={styles.highlightDescription}>
                  Status: {appt.status.toUpperCase()}
                  {appt.notes ? ` · ${appt.notes}` : ""}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
