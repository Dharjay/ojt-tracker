   let entries = JSON.parse(localStorage.getItem("ojt_entries2") || "[]");
      let requiredMinutes = parseInt(
        localStorage.getItem("ojt_req2") || "29160",
      );

      function timeToMin(t) {
        const [h, m] = t.split(":").map(Number);
        return h * 60 + m;
      }

      function minToHM(m) {
        const h = Math.floor(m / 60);
        const mn = m % 60;
        return `${h}h ${String(mn).padStart(2, "0")}m`;
      }

      function fmtTime(t) {
        const [h, m] = t.split(":").map(Number);
        const ampm = h >= 12 ? "PM" : "AM";
        const hh = h % 12 || 12;
        return `${hh}:${String(m).padStart(2, "0")} ${ampm}`;
      }

      function fmtDate(d) {
        const dt = new Date(d + "T00:00:00");
        return dt.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }

      function addEntry() {
        const date = document.getElementById("inp-date").value;
        const timeIn = document.getElementById("inp-in").value;
        const timeOut = document.getElementById("inp-out").value;

        if (!date || !timeIn || !timeOut) {
          alert("Please fill in all fields.");
          return;
        }

        const inMin = timeToMin(timeIn);
        const outMin = timeToMin(timeOut);

        if (outMin <= inMin) {
          alert("Time Out must be after Time In.");
          return;
        }

        const total = outMin - inMin;
        entries.push({ date, timeIn, timeOut, total, id: Date.now() });
        entries.sort((a, b) => a.date.localeCompare(b.date));
        save();
        render();

        document.getElementById("inp-date").value = "";
        document.getElementById("inp-in").value = "";
        document.getElementById("inp-out").value = "";
      }

      function deleteEntry(id) {
        entries = entries.filter((e) => e.id !== id);
        save();
        render();
      }

      function clearAll() {
        if (!entries.length) return;
        if (confirm("Clear all entries?")) {
          entries = [];
          save();
          render();
        }
      }

      function updateRequired() {
        const v = parseInt(document.getElementById("req-hours").value);
        if (!isNaN(v) && v > 0) {
          requiredMinutes = v * 60;
          localStorage.setItem("ojt_req2", requiredMinutes);
          render();
        }
      }

      function save() {
        localStorage.setItem("ojt_entries2", JSON.stringify(entries));
      }

      function render() {
        const body = document.getElementById("log-body");
        const totalMin = entries.reduce((s, e) => s + e.total, 0);
        const days = entries.length;
        const avgMin = days ? Math.round(totalMin / days) : 0;
        const pct = Math.min(
          100,
          Math.round((totalMin / requiredMinutes) * 100),
        );
        const remaining = Math.max(0, requiredMinutes - totalMin);
        const reqH = requiredMinutes / 60;

        document.getElementById("stat-total").textContent = minToHM(totalMin);
        document.getElementById("stat-days").textContent = days;
        document.getElementById("stat-avg").textContent = minToHM(avgMin);
        document.getElementById("stat-pct").textContent = pct + "%";
        document.getElementById("prog-fill").style.width = pct + "%";
        document.getElementById("prog-label").textContent =
          `${minToHM(totalMin)} / ${reqH}h 00m`;
        document.getElementById("prog-done").textContent =
          minToHM(totalMin) + " done";
        document.getElementById("prog-left").textContent =
          minToHM(remaining) + " remaining";

        if (!entries.length) {
          body.innerHTML = `<tr><td colspan="6"><div class="empty-state"><span class="empty-icon">📋</span>No entries yet. Add your first day above.</div></td></tr>`;
          return;
        }

        body.innerHTML = entries
          .map(
            (e, i) => `
      <tr>
        <td class="num-col">${i + 1}</td>
        <td>${fmtDate(e.date)}</td>
        <td>${fmtTime(e.timeIn)}</td>
        <td>${fmtTime(e.timeOut)}</td>
        <td class="hours-col">${minToHM(e.total)}</td>
        <td><button class="btn-del" onclick="deleteEntry(${e.id})" title="Delete">×</button></td>
      </tr>
    `,
          )
          .join("");
      }

      document.getElementById("req-hours").value = requiredMinutes / 60;
      render();