import './styles.css';
import onChange from 'on-change';

import { formatDate, getTaskStatusColor } from './utils.js';

const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjU1ZWFmYWNiMDVmNGI5MWQxMWViZGU0OWY3MjkxNGNkMTIyMDNhYmUzMjUxZmYxNzg0NTA5NmYzNTNiOWY1OGI3ZjI2ZWE0YjU5ZjFjMDQ1In0.eyJhdWQiOiI0MjE3MjEzNy00MDg0LTQyYTUtYTIzZC03YjcwMjBjMGZjODAiLCJqdGkiOiI1NWVhZmFjYjA1ZjRiOTFkMTFlYmRlNDlmNzI5MTRjZDEyMjAzYWJlMzI1MWZmMTc4NDUwOTZmMzUzYjlmNThiN2YyNmVhNGI1OWYxYzA0NSIsImlhdCI6MTcyNzU0MDk2MiwibmJmIjoxNzI3NTQwOTYyLCJleHAiOjE3NDA3MDA4MDAsInN1YiI6IjExNTc3MDkwIiwiZ3JhbnRfdHlwZSI6IiIsImFjY291bnRfaWQiOjMxOTc2NDk4LCJiYXNlX2RvbWFpbiI6ImFtb2NybS5ydSIsInZlcnNpb24iOjIsInNjb3BlcyI6WyJjcm0iLCJmaWxlcyIsImZpbGVzX2RlbGV0ZSIsIm5vdGlmaWNhdGlvbnMiLCJwdXNoX25vdGlmaWNhdGlvbnMiXSwiaGFzaF91dWlkIjoiOWI4ZDI3NGQtNmM3Ny00MjAwLTkyMDQtYWI3MmM5YWY3NTMzIiwiYXBpX2RvbWFpbiI6ImFwaS1iLmFtb2NybS5ydSJ9.TOVS5qYhAxuo7DqINhmCB5Us3KAEBILkzXeT0tNSkVYvVWcP9eGX-vxZLuR24qzWXoIDKmwk5MWClnOs3QF_lDzCreLZjKYtIk2i7Az_ZmYzRl-66TV4pFk7SziNeN6qW9UhjVBcVjwusyGDcnwSQRyAmsXNdwh_rXLCMx0RFrWZNkZtxLv7HuuZcRG7eUIiWjy5zGUwo6hV1YmFP3lvaRhaDN3yA0cP0n8kpk5RhZPwoehHt6ns5dHgdSnpPKmumhT-VoZSRtA1lguR1v9LZDkoVcP1s_HnYj00_1CisV-u7i2EhusmylxttBZip58VVOV6Qq37Bx5dF5ELPrCDrg'
const subdomain = 'svetlanaaanisimova';
const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
const baseUrl = `https://${subdomain}.amocrm.ru/api/v4/leads`;

const state = {
  leads: {
    errorMessage: '',
    status: '',
    leads: [],
  },
  uiState: {
    currentLead: null,
    status: '',
    selectedLeadId: null,
    errorMessage: '',
  }
};

const spinner = document.querySelector('.spinner');
const feedback = document.querySelector('.feedback');
const modal = document.querySelector('.modal');
const modalContent = document.querySelector('.modal-content');
const modalSpinner = document.querySelector('.modal-spinner');
const modalTitle = document.querySelector('.modal-title h2');
const modalCloseButton = document.querySelector('button');
const card = document.querySelector('.card');
const tbody = document.querySelector('tbody');

const renderCard = (state) => {
  const { id, closest_task_at} = state.uiState.currentLead;
  card.innerHTML = '';

  const idParagraph = document.createElement('p');
  const idStrong = document.createElement('strong');
  idStrong.textContent = `ID: ${id}`;
  idParagraph.appendChild(idStrong);


  const dateParagraph = document.createElement('p');
  const dateStrong = document.createElement('strong');
  dateStrong.textContent = `Дата: ${formatDate(closest_task_at)}`;
  dateParagraph.appendChild(dateStrong);

  const statusContainer = document.createElement('div');
  statusContainer.classList.add('status-container');

  const statusParagraph = document.createElement('p');
  const statusStrong = document.createElement('strong');
  statusStrong.textContent = 'Статус ближайшей задачи:';
  statusParagraph.appendChild(statusStrong);

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '20');
  svg.setAttribute('height', '20');

  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', '10');
  circle.setAttribute('cy', '10');
  circle.setAttribute('r', '9');
  circle.setAttribute('fill', getTaskStatusColor(closest_task_at));


  svg.appendChild(circle);
  statusContainer.appendChild(statusParagraph);
  statusContainer.appendChild(svg);

  card.append(idParagraph, dateParagraph, statusContainer);
};

const renderTableRows = (leads) => {
  tbody.innerHTML = '';

  leads.forEach(({ id, name, price}) => {
    const tr = document.createElement('tr');

    const tdName = document.createElement('td');
    tdName.textContent = name;
    tr.appendChild(tdName);

    const tdBudget = document.createElement('td');
    tdBudget.textContent = `€ ${price}`;
    tr.appendChild(tdBudget);

    const tdId = document.createElement('td');
    tdId.textContent = id;
    tr.appendChild(tdId);
    tr.setAttribute("id", id);

    tr.addEventListener('click', handleRowClick);

    tbody.appendChild(tr);
  });
};

const showModal = () => {
  modalContent.style.display = 'block';
  modal.style.display = 'block';
};

const hideModal = () => {
  modalContent.style.display = 'none';
  modal.style.display = 'none';
}

const renderCardError = (errorMessage) => {
  modalTitle.textContent = 'Ошибка';
  const div = document.createElement('div');
  div.classList.add('cardFeedback');
  const p = document.createElement('p');
  p.textContent = errorMessage;
  div.appendChild(p);
  card.appendChild(div);
}

const renderTable = (state) => {
  const { status, leads, errorMessage } = state.leads;

  switch (status) {
    case 'loading': {
      feedback.innerHTML = '';
      tbody.innerHTML = '';
      spinner.style.display = 'block';
      break;
    }
    case 'loaded': {
      feedback.innerHTML = '';
      spinner.style.display = 'none';
      renderTableRows(leads);
      break;
    }
    case 'error': {
      spinner.style.display = 'none';
      feedback.textContent = errorMessage;
      break;
    }
    default: break;
  }
};

const renderModal = (state) => {
  const { status, errorMessage } = state.uiState;

  switch (status) {
    case 'loading': {
      card.innerHTML = '';
      modalTitle.textContent = '';
      modalSpinner.style.display = 'block';
      break;
    }
    case 'loaded': {
      modalSpinner.style.display = 'none';
      modalTitle.textContent = state.uiState.currentLead.name;
      renderCard(state);
      break;
    }
    case 'error': {
      modalSpinner.style.display = 'none';
      renderCardError(errorMessage);
      break;
    }
    default:
      break;
  }
};

const watch = (state) => onChange(state, (path) => {
  switch (path) {
    case 'leads.status': {
      renderTable(state);
      break;
    }
    case 'uiState.status': {
      renderModal(state);
      break;
    }
    default: {
      break;
    }
  }
});

const handleRowClick = async (e) => {
  const leadId = e.currentTarget.id;
  watchedState.uiState.selectedLeadId = leadId;
  showModal();
  await fetchLeadById(leadId);
};

modalCloseButton.addEventListener('click', () => {
  hideModal();
  watchedState.uiState.status = '';
  watchedState.uiState.currentLead = null;
  watchedState.uiState.errorMessage = '';
  watchedState.uiState.selectedLeadId = null;
});

const watchedState = watch(state);

const fetchLeadById = async (leadId) => {
  watchedState.uiState.status = 'loading';

  try {
    const response = await fetch(`${proxyUrl}${baseUrl}/${leadId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Ошибка получения данных о сделки:', errorData);
      watchedState.uiState.errorMessage = 'Ошибка при загрузке данных сделки.';
      watchedState.uiState.status = 'error';
    }

    const data = await response.json();
    watchedState.uiState.currentLead = data;
    watchedState.uiState.status = 'loaded';
  } catch (error) {
    watchedState.uiState.errorMessage = 'Ошибка при загрузке данных сделки.';
    watchedState.uiState.status = 'error';
    console.error('Ошибка получения данных о сделки:', error.message);
  }
};

let timerID;
const fetchLeadsWithDelay = async (page = 1, interval = 1000) => {
  const totalLeads = 10;
  const limit = 3;
  const totalPages = Math.ceil(totalLeads / limit);

  const fetchLeads = async (currentPage, limit) => {
    watchedState.leads.status = 'loading';

    try {
      const response = await fetch(`${proxyUrl}${baseUrl}?page=${currentPage}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        watchedState.leads.errorMessage = 'Ошибка загрузки данных. Попробуйте перезагрузить страницу.';
        watchedState.leads.status = 'error';
        const errorData = await response.json();
        console.error('Ошибка получения данных списка сделок:', errorData);
        return;
      }

      const leadsData = await response.json();
      const leads = leadsData._embedded.leads;
      watchedState.leads.leads.push(...leads);

      if (currentPage >= totalPages) {
        watchedState.leads.status = 'loaded';
        return;
      }

      if (timerID) {
        clearTimeout(timerID);
      }

      timerID = setTimeout(() => {
        fetchLeads(currentPage + 1, limit);
      }, interval);

    } catch (error) {
      watchedState.leads.errorMessage = 'Ошибка загрузки данных. Попробуйте перезагрузить страницу.';
      watchedState.leads.status = 'error';
      console.error('Ошибка получения данных списка сделок:', error.message);
    }
  };

  await fetchLeads(page, limit);
};

await fetchLeadsWithDelay(1, 1000);
