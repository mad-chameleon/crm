const renderTableRows = (rows) => {
  const tbody = document.querySelector('tbody');
  tbody.innerHTML = '';

  rows.forEach(({ id, name, budget }) => {
    const tr = document.createElement('tr');

    const tdId = document.createElement('td');
    tdId.textContent = id;
    tr.appendChild(tdId);

    const tdName = document.createElement('td');
    tdName.textContent = name;
    tr.appendChild(tdName);

    const tdBudget = document.createElement('td');
    tdBudget.textContent = budget;
    tr.appendChild(tdBudget);

    tbody.appendChild(tr);
  });
};

