const STORAGE_KEY = 'bmi_clinical_logs_v1';

function hitungBMI(simpanKeRiwayat = true) {
    const tinggiInput = document.getElementById('tinggiInput');
    const beratInput = document.getElementById('beratInput');
    const errorBox = document.getElementById('errorBox');
    const errorText = document.getElementById('errorText');

    const tinggiCm = parseFloat(tinggiInput.value);
    const beratKg = parseFloat(beratInput.value);

    if (isNaN(tinggiCm) || isNaN(beratKg) || tinggiCm <= 0 || beratKg <= 0) {
        errorText.textContent = "Masukkan angka tinggi dan berat badan yang valid.";
        errorBox.style.display = "flex";
        return;
    }

    if (tinggiCm < 50 || tinggiCm > 250 || beratKg < 10 || beratKg > 300) {
        errorText.textContent = "Rentang valid: Tinggi 50–250 cm dan Berat 10–300 kg.";
        errorBox.style.display = "flex";
        return;
    }

    errorBox.style.display = "none";

    const tinggiMeter = tinggiCm / 100;
    const bmi = beratKg / (tinggiMeter * tinggiMeter);
    const bmiBulat = bmi.toFixed(1);

    const beratMin = (18.5 * tinggiMeter * tinggiMeter);
    const beratMax = (24.9 * tinggiMeter * tinggiMeter);

    let kategori = "";
    let kodeTema = "";
    let saran = "";
    let selisihTeks = "";

    if (bmi < 18.5) {
        kategori = "Kurus (Underweight)";
        kodeTema = "under";
        const kurangKg = (beratMin - beratKg).toFixed(1);
        selisihTeks = `+${kurangKg} kg menuju ideal`;
        saran = "Tingkatkan asupan kalori padat nutrisi dan protein berkualitas untuk mencapai batas berat minimum ideal.";
    } else if (bmi >= 18.5 && bmi <= 24.9) {
        kategori = "Normal / Ideal";
        kodeTema = "normal";
        selisihTeks = "Proporsi Optimal";
        saran = "Proporsi berat dan tinggi badan berada pada titik optimal. Pertahankan asupan nutrisi seimbang dan aktivitas fisik rutin.";
    } else if (bmi >= 25.0 && bmi <= 29.9) {
        kategori = "Gemuk (Overweight)";
        kodeTema = "over";
        const lebihKg = (beratKg - beratMax).toFixed(1);
        selisihTeks = `-${lebihKg} kg menuju ideal`;
        saran = "Kurangi asupan gula sederhana dan lemak jenuh, serta tingkatkan durasi olahraga kardiovaskular 150 menit per minggu.";
    } else {
        kategori = "Obesitas";
        kodeTema = "obese";
        const lebihKg = (beratKg - beratMax).toFixed(1);
        selisihTeks = `-${lebihKg} kg menuju ideal`;
        saran = "Disarankan menerapkan defisit kalori terukur dan berkonsultasi dengan tenaga medis atau ahli gizi klinis.";
    }

    document.getElementById('bmiScore').textContent = bmiBulat;
    document.getElementById('pinBadge').textContent = bmiBulat;
    document.getElementById('metaDimension').textContent = `${tinggiCm} cm · ${beratKg} kg`;
    document.getElementById('statusText').textContent = kategori;

    const statusBadge = document.getElementById('statusBadge');
    statusBadge.className = `status-pill ${kodeTema}`;

    document.getElementById('idealRange').textContent = `${beratMin.toFixed(1)} – ${beratMax.toFixed(1)} kg`;
    document.getElementById('targetDelta').textContent = selisihTeks;
    document.getElementById('clinicalNote').innerHTML = `<strong>Rekomendasi:</strong> ${saran}`;

    let persenPin = 0;
    if (bmi <= 18.5) {
        persenPin = ((bmi - 12) / (18.5 - 12)) * 25;
    } else if (bmi <= 25.0) {
        persenPin = 25 + ((bmi - 18.5) / (25.0 - 18.5)) * 25;
    } else if (bmi <= 30.0) {
        persenPin = 50 + ((bmi - 25.0) / (30.0 - 25.0)) * 20;
    } else {
        persenPin = 70 + ((bmi - 30.0) / (38.0 - 30.0)) * 30;
    }
    persenPin = Math.max(3, Math.min(97, persenPin));
    document.getElementById('spectrumPin').style.left = `${persenPin}%`;

    if (simpanKeRiwayat) {
        simpanRiwayat({
            id: Date.now(),
            waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            tanggal: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
            tinggi: tinggiCm,
            berat: beratKg,
            bmi: bmiBulat,
            kategori: kategori,
            tema: kodeTema
        });
    }
}

function isiPreset(tinggi, berat) {
    document.getElementById('tinggiInput').value = tinggi;
    document.getElementById('beratInput').value = berat;
    hitungBMI(true);
}

function resetForm() {
    document.getElementById('tinggiInput').value = "";
    document.getElementById('beratInput').value = "";
    document.getElementById('errorBox').style.display = "none";
    document.getElementById('tinggiInput').focus();
}

function ambilDataRiwayat() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
        return [];
    }
}

function simpanRiwayat(itemBaru) {
    const daftar = ambilDataRiwayat();
    daftar.unshift(itemBaru);
    const terbatas = daftar.slice(0, 12);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(terbatas));
    renderRiwayat();
}

function hapusSatuRiwayat(id, event) {
    event.stopPropagation();
    const daftar = ambilDataRiwayat().filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(daftar));
    renderRiwayat();
}

function hapusSemuaRiwayat() {
    localStorage.removeItem(STORAGE_KEY);
    renderRiwayat();
}

function muatDariRiwayat(tinggi, berat) {
    document.getElementById('tinggiInput').value = tinggi;
    document.getElementById('beratInput').value = berat;
    hitungBMI(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderRiwayat() {
    const container = document.getElementById('historyContainer');
    const clearBtn = document.getElementById('clearHistoryBtn');
    const daftar = ambilDataRiwayat();

    if (daftar.length === 0) {
        clearBtn.style.display = 'none';
        container.innerHTML = `<div class="empty-state">Belum ada catatan riwayat pengukuran.</div>`;
        return;
    }

    clearBtn.style.display = 'inline-block';
    container.innerHTML = daftar.map(item => `
        <div class="history-row" onclick="muatDariRiwayat(${item.tinggi}, ${item.berat})" title="Klik untuk melihat detail">
            <div class="history-time mono">${item.tanggal}, ${item.waktu}</div>
            <div class="history-specs mono">
                ${item.tinggi} cm <span>/</span> ${item.berat} kg
            </div>
            <div class="status-pill ${item.tema}" style="padding: 3px 10px; font-size: 0.75rem;">
                <span class="status-dot"></span>
                <span class="mono">${item.bmi}</span> · ${item.kategori.split(' ')[0]}
            </div>
            <button type="button" class="btn-icon-del" onclick="hapusSatuRiwayat(${item.id}, event)" title="Hapus catatan">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>
    `).join('');
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        hitungBMI(true);
    }
});

window.addEventListener('DOMContentLoaded', () => {
    hitungBMI(false);
    renderRiwayat();
});