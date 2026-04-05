(function () {
  const expressionEl = document.getElementById('expression');
  const resultEl = document.getElementById('result');

  let current = '0';
  let expression = '';
  let operator = null;
  let previousValue = null;
  let shouldResetCurrent = false;
  let lastEquals = false;
  let lastOp = null;
  let lastOperand = null;

  function formatNumber(num) {
    if (num === 'Error') return 'Error';
    const n = parseFloat(num);
    if (!isFinite(n)) return 'Error';
    if (Math.abs(n) > 1e12 || (Math.abs(n) < 1e-8 && n !== 0)) {
      return n.toExponential(6);
    }
    const str = String(n);
    if (str.includes('.') && str.split('.')[1].length > 10) {
      return parseFloat(n.toFixed(10)).toString();
    }
    return str;
  }

  function updateDisplay() {
    resultEl.textContent = current === 'Error' ? 'Error' : current;
    expressionEl.textContent = expression;

    const len = current.length;
    if (len > 12) resultEl.style.fontSize = '24px';
    else if (len > 9) resultEl.style.fontSize = '30px';
    else resultEl.style.fontSize = '';
  }

  function calculate(a, op, b) {
    a = parseFloat(a);
    b = parseFloat(b);
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b === 0 ? NaN : a / b;
      default: return b;
    }
  }

  const opSymbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };

  function handleDigit(d) {
    if (current === 'Error') {
      current = d;
      expression = '';
      operator = null;
      previousValue = null;
    } else if (shouldResetCurrent || current === '0') {
      if (lastEquals) {
        expression = '';
        operator = null;
        previousValue = null;
      }
      current = d;
    } else {
      if (current.replace('-', '').replace('.', '').length >= 12) return;
      current += d;
    }
    shouldResetCurrent = false;
    lastEquals = false;
    updateDisplay();
  }

  function handleDecimal() {
    if (shouldResetCurrent) {
      if (lastEquals) {
        expression = '';
        operator = null;
        previousValue = null;
      }
      current = '0.';
      shouldResetCurrent = false;
      lastEquals = false;
    } else if (!current.includes('.')) {
      current += '.';
    }
    updateDisplay();
  }

  function handleOperator(op) {
    if (current === 'Error') return;
    lastEquals = false;

    if (operator && !shouldResetCurrent) {
      const result = calculate(previousValue, operator, current);
      const formatted = formatNumber(result);
      current = formatted;
      expression = formatted + ' ' + opSymbols[op] + ' ';
      previousValue = formatted;
    } else {
      expression = current + ' ' + opSymbols[op] + ' ';
      previousValue = current;
    }

    operator = op;
    shouldResetCurrent = true;
    updateActiveOp(op);
    updateDisplay();
  }

  function handleEquals() {
    if (current === 'Error') return;

    if (lastEquals && lastOp && lastOperand !== null) {
      const result = calculate(current, lastOp, lastOperand);
      const formatted = formatNumber(result);
      expression = current + ' ' + opSymbols[lastOp] + ' ' + lastOperand + ' =';
      current = formatted;
    } else if (operator) {
      lastOp = operator;
      lastOperand = current;
      const result = calculate(previousValue, operator, current);
      const formatted = formatNumber(result);
      expression = previousValue + ' ' + opSymbols[operator] + ' ' + current + ' =';
      current = formatted;
      operator = null;
      previousValue = null;
    }

    shouldResetCurrent = true;
    lastEquals = true;
    clearActiveOp();
    updateDisplay();
  }

  function handlePercent() {
    if (current === 'Error') return;
    const val = parseFloat(current);
    if (operator && previousValue !== null) {
      current = formatNumber(parseFloat(previousValue) * val / 100);
    } else {
      current = formatNumber(val / 100);
    }
    updateDisplay();
  }

  function handleClear() {
    current = '0';
    expression = '';
    operator = null;
    previousValue = null;
    shouldResetCurrent = false;
    lastEquals = false;
    lastOp = null;
    lastOperand = null;
    clearActiveOp();
    updateDisplay();
  }

  function handleBackspace() {
    if (current === 'Error' || shouldResetCurrent) {
      current = '0';
    } else if (current.length === 1 || (current.length === 2 && current[0] === '-')) {
      current = '0';
    } else {
      current = current.slice(0, -1);
    }
    updateDisplay();
  }

  function updateActiveOp(op) {
    document.querySelectorAll('.btn.op').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.value === op);
    });
  }

  function clearActiveOp() {
    document.querySelectorAll('.btn.op').forEach(function (btn) {
      btn.classList.remove('active');
    });
  }

  document.querySelector('.buttons').addEventListener('click', function (e) {
    const btn = e.target.closest('.btn');
    if (!btn) return;
    const action = btn.dataset.action;
    switch (action) {
      case 'digit': handleDigit(btn.dataset.value); break;
      case 'decimal': handleDecimal(); break;
      case 'operator': handleOperator(btn.dataset.value); break;
      case 'equals': handleEquals(); break;
      case 'percent': handlePercent(); break;
      case 'clear': handleClear(); break;
      case 'backspace': handleBackspace(); break;
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key >= '0' && e.key <= '9') {
      handleDigit(e.key);
      e.preventDefault();
    } else if (e.key === '.') {
      handleDecimal();
      e.preventDefault();
    } else if (e.key === '+') {
      handleOperator('+');
      e.preventDefault();
    } else if (e.key === '-') {
      handleOperator('-');
      e.preventDefault();
    } else if (e.key === '*') {
      handleOperator('*');
      e.preventDefault();
    } else if (e.key === '/') {
      handleOperator('/');
      e.preventDefault();
    } else if (e.key === '%') {
      handlePercent();
      e.preventDefault();
    } else if (e.key === 'Enter' || e.key === '=') {
      handleEquals();
      e.preventDefault();
    } else if (e.key === 'Backspace') {
      handleBackspace();
      e.preventDefault();
    } else if (e.key === 'Escape' || e.key === 'Delete') {
      handleClear();
      e.preventDefault();
    }
  });

  updateDisplay();
})();
