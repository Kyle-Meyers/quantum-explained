function gcd(a, b) {
    if (b === 0n) return a;
    return gcd(b, a % b);
}

function isPrime(n) {
    var max = BigInt(Math.floor(Math.sqrt(Number(n))));
    for (var i = 2n; i <= max; i++) {
        if (n % i === 0n) {
            return false;
        }
    }
    return true;
}

function isPrimePower(n) {
    let sqrtN = Math.sqrt(n) + 1;
    let primes = [];
    let prime = Array.from({length: sqrtN+1}, (_, i) => 0);

    for(let i = 0; i < sqrtN; i++)
        prime[i] = true;

    for(let p = 2; p * p <= sqrtN; p++) {
        if (prime[p] == true) {
            for(let i = p * 2; i <= sqrtN; i += p)
                prime[i] = false;
        }
    }

    for(let i = 2; i <= sqrtN; i++) {
        if (prime[i] == true)
            primes.push(i);
    }

    for(let ii = 0; ii < primes.length; ii++) {
        let i = primes[ii];
        if (n % i == 0) {
            let c = 0;
            while (n % i == 0) {
                n /= i;
                c += 1;
            }

            if (n == 1)
                return [i, c];
            else
                return false;
        }
    }
    return false;
}

function formatList(list, crop=true) {
    if (crop && list.length > 6) {
        return `[${list.slice(0, 3).map(sublist => `(${sublist.map(formatNumber).join(', ')})`).join(', ')}...${list.slice(-3).map(sublist => `(${sublist.map(formatNumber).join(', ')})`).join(', ')}]`;
    }
    return '[' + list.map(sublist => `(${sublist.map(formatNumber).join(', ')})`).join(', ') + ']';
}

function formatNumber(num, digits=true) {
    let numStr = num.toString();
    if (numStr.length > 45) {
        if (digits) {
            return `${numStr.slice(0, 3)}...${numStr.slice(-3)} (${numStr.length} digits)`;
        } else {
            return `${numStr.slice(0, 3)}...${numStr.slice(-3)}`;
        }
    }
    return numStr;
}

let outputs = [];
let i = 0;

function next() {
    i++;
    loadText(i);
}

function previous() {
    i--;
    loadText(i);
}

function loadText(i) {
    let text = outputs[i];
    if (text.length == 1) {
        document.getElementById("shors-text-single").innerText = text[0];
        document.getElementById("shors-text-1").innerText = "";
        document.getElementById("shors-text-2").innerText = "";
        document.getElementById("shors-text").style.padding = "0 15px 15px 15px";
    } else {
        document.getElementById("shors-text-1").innerText = text[0];
        document.getElementById("shors-text-2").innerText = text[1];
        document.getElementById("shors-text-single").innerText = "";
        document.getElementById("shors-text").style.padding = "15px";
    }

    if (i == outputs.length - 1) {
        document.getElementById("shors-next").style = "display: none;";
    }
    else {
        document.getElementById("shors-next").style = "";
    }

    if (i == 0) {
        document.getElementById("shors-previous").style = "display: none;";
    }
    else {
        document.getElementById("shors-previous").style = "";
    }
}

function shorsStart() {
    outputs = [];
    i = 0;

    let N = BigInt(document.getElementById("shors-n").value);

    if (isPrime(N)) {
        outputs.push([`${N} is prime, please input a composite non-prime power number`]);
        loadText(i);
        return false;
    }

    let primePower = isPrimePower(Number(N));
    if (primePower !== false) {
        outputs.push([`${N} is a power of a prime (${primePower[0]}^${primePower[1]}), please input a composite non-prime power number`]);
        loadText(i);
        return false;
    }

    if (N >= 10000n) {
        outputs.push([`WARNING: You're attempting to factor a large number, it's likely that this simulation won't attempt p values large enough to get the correct answer. Consider choosing a smaller number.`]);
        loadText(i);
    }

    document.getElementById("shors-g").style = "";
    document.getElementById("shors-g").max = `${N-1n}`;
    document.getElementById("shors-run").style = "";
    document.getElementById("shors-g-label").style = "";
    document.getElementById("shors-text-single").innerText = "";
    document.getElementById("shors-text-1").innerText = "";
    document.getElementById("shors-text-2").innerText = "";
    document.getElementById("shors-next").style = "display: none;";
    document.getElementById("shors-previous").style = "display: none;";
    return true;
}

function shors() {
    if (shorsStart() == false) return;

    let g = BigInt(document.getElementById("shors-g").value);
    let N = BigInt(document.getElementById("shors-n").value);

    if (g == 0n) {
        g = BigInt(Math.floor(Math.random() * (Number(N) - 2) + 2));
        while (gcd(N, g) != 1n) {
            g = BigInt(Math.floor(Math.random() * (Number(N) - 2) + 2));
        }
        outputs.push([`We are factoring ${N}, and the random guess for a factor is ${g}`]);
    }
    else {
        outputs.push([`We are factoring ${N}, and the guess for a factor is ${g}`]);
    }

    let gcdNg = gcd(N, g);

    if (gcdNg !== 1n) {
        outputs.push([`The GCD of N (${N}) and g (${g}) is ${gcdNg}`, `You got lucky! ${gcdNg} is already a factor of N, so we're done!`]);
        loadText(i);
        return;
    }

    outputs.push([`The GCD of N and g is ${gcdNg}`, `There are no shared factors between ${N} and ${g}, so let's move on to the next step`]);
    var ps = [];
    let maxp = 1n;
    for (let i = 0; i < 5000; i++) {
        ps.push(maxp);
        maxp++;
    }
    outputs.push([`Let's first create a "superposition" of a few possible p values`, `[${ps.slice(0, 3).join(", ")}...${ps.slice(-3).join(", ")}]`]);


    var pGToTheP = [];
    for (let p of ps) {
        pGToTheP.push([p, g ** p]);
    }

    outputs.push([`Now let's turn that into a superposition of p's and g^p's`, `[${formatList(pGToTheP)}]`]);

    var pAndR = [];
    pGToTheP.forEach(function (item) {
        pAndR.push([item[0], item[1] % N]);
    });

    outputs.push([`Now let's turn that into a superposition of p's and remainders of g^p / N`, `[${formatList(pAndR)}]`]);

    let values = pAndR.map(v => v[1]);

    if (new Set(values).size == pAndR.length) {
        outputs.push([`Every value in this list is different. On a Quantum Computer with more p values being tested, it would find at least two of the same values and output the correct answer. Try again with a smaller number or different g value to get something that might work.`]);
        loadText(i);
        return;
    }

    pAndR = pAndR.filter(e => values.filter(v => v == e[1]).length !== 1); // Wouldn't happen on quantum computers, but included so it works more often

    let randomR = pAndR[Math.floor(Math.random() * pAndR.length)][1];
    pAndR = pAndR.filter(e => e[1] == randomR);

    if (pAndR.length < 20) {
        outputs.push([`Now let's measure a random remainder, ${randomR}. Because of the rules of entanglement, now the superposition only contains things with that remainder:`, formatList(pAndR, crop=false)]);
    } else {
        outputs.push([`Now let's measure a random remainder, ${randomR}. Because of the rules of entanglement, now the superposition only contains things with that remainder:`, formatList(pAndR)]);
    }

    let p = pAndR[1][0] - pAndR[0][0];

    let xOverP = [];
    for (let i = 0; i < 3; i++) {
        let x = Math.floor(Math.random() * (10 - 1) + 1);
        while (x /

 Number(p) in xOverP) {
            x = Math.floor(Math.random() * (10 - 1) + 1);
        }
        xOverP.push(x / Number(p));
    }

    outputs.push([`Remember, we can't just measure this superposition because that will collapse it into one random, useless state. So instead we send it through a Quantum Fourier Transform, which outputs a random number over p, x/p. After doing all of this 3 times, the 3 random values we get are ${xOverP[0]}, ${xOverP[1]}, and ${xOverP[2]}. A simple calculation can find p to be ${p} based on that.`]);

    if (p % 2n === 1n) {
        outputs.push([`The algorithm didn't output the factors this time. In this case, the correct p was odd. Because we will bring something to the p/2 power, it will not be an integer. Try again with another g value and it will hopefully work.`]);
        loadText(i);
        return;
    }

    let plusOne = g ** (p / 2n) + 1n;
    let minusOne = g ** (p / 2n) - 1n;
    outputs.push([`To find the factors, first we find g^(p/2) ± 1. In this case, it is ${g}^(${p}/2) ± 1, which comes out to be ${formatNumber(plusOne)} and ${formatNumber(minusOne)}`]);

    let gcd1 = gcd(plusOne, N);
    let gcd2 = gcd(minusOne, N);
    outputs.push([`Now we need to find the GCD of each of those two and N.`, `GCD(${formatNumber(plusOne, digits=false)}, ${N}) = ${formatNumber(gcd1)}, and GCD(${formatNumber(minusOne, digits=false)}, ${N}) = ${formatNumber(gcd2)}.`]);

    if (gcd1 * gcd2 === N && gcd1 !== 1n && gcd2 !== 1n) {
        outputs.push([`The algorithm correctly found factors of ${N}! They are ${gcd1} and ${gcd2}.`]);
    } else {
        if (plusOne === N || minusOne === N) {
            outputs.push([`The algorithm seemed to work incorrectly. This can randomly happen depending on the g, so try again and hopefully it will work.`, `It didn't work because in this case, one of the guesses is ${N}, making their GCDs the trivial case of 1 and ${N}.`]);
        } else if (N % plusOne === 0n || N % minusOne === 0n) {
            outputs.push([`The algorithm seemed to work incorrectly. This can randomly happen depending on the g, so try again and hopefully it will work.`, `It didn't work because in this case, one of the guesses is a multiple of ${N}, making their GCD values the trivial case of 1 and ${N}.`]);
        } else if (N % gcd1 === 0n && N % gcd2 === 0n) {
            outputs.push([`In this case, the GCDs didn't correctly find THE SAME PAIR of factors, but ${gcd1} is a factor, and so is ${gcd2}. Now it's easy to find the other factors using simple division.`, `The two pairs of factors found are ${gcd1} and ${N / gcd1}, and ${gcd2} and ${N / gcd2}`]);
        }
    }

    loadText(i);
}
