const protocol = performance.getEntries()[0].nextHopProtocol;
document.getElementById('protocol').textContent = `THIS REQUEST WAS SERVED WITH ${protocol} ${
	protocol === 'http/1.1' ? ':(((((((((' : ':)))))))))))'
}`;
