(function () {
	const screen = document.getElementById('screen');
	const preview = document.getElementById('preview');
	const buttons = document.querySelector('.buttons');

	let input = '0';
	let lastAnswer = 0;

	function updateDisplays() {
		screen.textContent = input || '0';
		const val = tryCompute(input);
		preview.textContent = Number.isFinite(val) ? String(val) : ' ';
	}

	function sanitize(expr) {
		return expr
			.replace(/x/g, '*')
			.replace(/÷/g, '/')
			.replace(/[^0-9+\-*/().\s]/g, '');
	}

	function tryCompute(expr) {
		const clean = sanitize(expr);
		if (!clean.trim()) return 0;
		try {
			// Disallow obviously broken endings
			if (/[*+/\-]$/.test(clean)) return NaN;
			// Limit consecutive decimals/operators
			if (/\.{2,}/.test(clean)) return NaN;
			// Evaluate using Function with strict whitelist
			// eslint-disable-next-line no-new-func
			const result = Function(`"use strict"; return (${clean});`)();
			if (typeof result === 'number' && Number.isFinite(result)) {
				return roundSmart(result);
			}
			return NaN;
		} catch (_) {
			return NaN;
		}
	}

	function roundSmart(n) {
		// Avoid floating point noise; keep up to 10 decimals
		const rounded = Math.round((n + Number.EPSILON) * 1e10) / 1e10;
		return rounded;
	}

	function appendValue(val) {
		if (input === '0' && /[0-9]/.test(val)) {
			input = val;
		} else {
			// Prevent duplicate operators
			if (isOperator(val) && isOperator(lastChar(input))) {
				input = input.slice(0, -1) + val;
			} else {
				input += val;
			}
		}
		updateDisplays();
	}

	function isOperator(ch) {
		return ['+', '-', 'x', '÷', '*', '/'].includes(ch);
	}

	function lastChar(str) {
		return str[str.length - 1];
	}

	function clearAll() {
		input = '0';
		lastAnswer = 0;
		updateDisplays();
	}

	function backspace() {
		if (input.length <= 1) {
			input = '0';
		} else {
			input = input.slice(0, -1);
		}
		updateDisplays();
	}

	function equals() {
		const val = tryCompute(input);
		if (Number.isFinite(val)) {
			lastAnswer = val;
			input = String(val);
			updateDisplays();
		}
	}

	buttons.addEventListener('click', (e) => {
		const target = e.target;
		if (!(target instanceof HTMLElement)) return;
		if (!target.classList.contains('btn')) return;
		const value = target.getAttribute('data-value');
		const action = target.getAttribute('data-action');

		if (action === 'clear') return clearAll();
		if (action === 'backspace') return backspace();
		if (action === 'equals') return equals();
		if (value) appendValue(value);
	});

	document.addEventListener('keydown', (e) => {
		const key = e.key;
		if (/^[0-9]$/.test(key)) {
			appendValue(key);
			return;
		}
		if (key === '.') return appendValue('.');
		if (key === '+') return appendValue('+');
		if (key === '-') return appendValue('-');
		if (key === '*') return appendValue('x');
		if (key === '/') return appendValue('÷');
		if (key === 'Enter' || key === '=') return equals();
		if (key === 'Backspace') return backspace();
		if (key === 'Escape' || key === 'Delete') return clearAll();
		if (key === '(' || key === ')') return appendValue(key);
	});

	updateDisplays();
})();
