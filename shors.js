function gcd(a,b) {
  return b === 0 ? a : gcd(b, a % b);
}

function isPrime(n) {
  var max = Math.floor(Math.sqrt(n));
  for( var i = 2 ; i <= max; i++) {
    if (n % i == 0) {
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

function formatList(list) {
  return '[' + list.map(sublist => `(${sublist.join(', ')})`).join(', ') + ']';
}

let loadingInterval;

function startLoadingAnimation() {
    let dots = 0;

    loadingInterval = setInterval(() => {
        let text = 'Loading' + '.'.repeat(dots);
        document.getElementById('shors-text-single').innerText = text;
        dots = (dots + 1) % 4;
    }, 500); // Change the interval to adjust the speed of the animation
}

function stopLoadingAnimation() {
    clearInterval(loadingInterval);
    document.getElementById('shors-text-single').innerText = "";
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
  
    let N = document.getElementById("shors-n").value;
  
    if (isPrime(N)) {
        outputs.push([`${N} is prime, please input a composite non-prime power number`]);
        loadText(i);
        return false;
    }

    let primePower = isPrimePower(N)
    if (primePower !== false) {
        outputs.push([`${N} is a power of a prime (${primePower[0]}^${primePower[1]}), please input a composite non-prime power number`]);
        loadText(i);
        return false;
    }

    if (N >= 1000) {
        outputs.push([`WARNING: You're attempting to factor a large number, it's likely that this simulation won't attempt p values large enough to get the correct answer. Consider choosing a smaller number.`])
        loadText(i);
    }

    stopLoadingAnimation();
    document.getElementById("shors-g").style = "";
    document.getElementById("shors-g").max = `${N-1}`;
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
    startLoadingAnimation();
  
    let g = document.getElementById("shors-g").value;
    let N = document.getElementById("shors-n").value;
  
    if (g == "") {
      g = Math.floor(Math.random()*(Math.floor(N)-2) + 2);
      outputs.push([`We are factoring ${N}, and the random guess for a factor is ${g}`]);
    }
    else {
      outputs.push([`We are factoring ${N}, and the guess for a factor is ${g}`]);
    }
  
    let gcdNg = gcd(N, g)

    if (gcdNg !== 1) {
      outputs.push([`The GCD of N (${N}) and g (${g}) is ${gcdNg}`, `You got lucky! ${gcdNg} is already a factor of N, so we're done!`]);
      stopLoadingAnimation();
      loadText(i);
      return;
    }

    outputs.push([`The GCD of N and g is ${gcdNg}`, `There are no shared factors between ${N} and ${g}, so let's move on to the next step`]);
    var ps = [];
    let maxp = 0;
    let over = false;
    while (!over) {
        if (Math.pow(g, maxp) > Number.MAX_SAFE_INTEGER) {
            over = true;
            break;
        }
        ps.push(maxp);
        maxp++;
        if (maxp > 30) 
          break;
    }
    outputs.push([`Let's first create a "superposition" of a few possible p values`, `[${ps.join(", ")}]`]);

    var pGToTheP = [];
    for (let p = 1; p < maxp; p++) {
        pGToTheP.push([p, Math.pow(g, p)]);
    }

    outputs.push([`Now let's turn that into a superposition of p's and g^p's`, formatList(pGToTheP)]);
  
    var pAndR = [];
    pGToTheP.forEach(function (item) {
        pAndR.push([item[0], item[1]%N]);
    });

    outputs.push([`Now let's turn that into a superposition of p's and remainders of g^p / N`, formatList(pAndR)]);

    let values = pAndR.map(v => v[1]);

    if (new Set(values).size == pAndR.length) {
        outputs.push([`Every value here is different. On a Quantum Computer with more p values being tested, it would find at least two of the same values and output the correct answer. For computational accuracy, I stopped values from reaching over 2^53 in this simulation. Try again with a smaller number or different g value to get something that might work.`]);
        stopLoadingAnimation();
        loadText(i);
        return;
    }

    pAndR = pAndR.filter(e => values.filter(v => v == e[1]).length !== 1) // Wouldn't happen on quantum computers, but included so it works more often

    let randomR = pAndR[Math.floor(Math.random() * pAndR.length)][1];
    pAndR = pAndR.filter(e => e[1] == randomR); 

    outputs.push([`Now let's measure a random remainder, ${randomR}. Because of the rules of entanglement, now the superposition only contains things with that remainder:`, formatList(pAndR)]);

    let p = pAndR[1][0] - pAndR[0][0];
  
    outputs.push([`Remember, we can't just measure this superposition because that will collapse it into one random, useless state. So instead we send it through a Quantum Fourier Transform, which outputs the frequency, 1/p.`, `The frequency, 1/p, is ${1/p}, which means the p value we're looking for is ${p}. This is essentially the distance between the p values in the previous step.`]);

    if (p%2 == 1) {
      outputs.push([`The algorithm didn't output the factors this time. In this case, the correct p was odd. Because we will bring something to the p/2 power, it will not be an integer. Try again with another g value and it will hopefully work.`]);
      stopLoadingAnimation();
      loadText(i);
      return;
    }
    
    let plusOne = Math.pow(g, (p/2)) + 1;
    let minusOne = Math.pow(g, (p/2)) - 1;
    outputs.push([`To find the factors, first we find g^(p/2) ± 1. In this case, it is ${g}^(${p}/2) ± 1, which comes out to be ${plusOne} and ${minusOne}`]);

    let gcd1 = gcd(plusOne, N);
    let gcd2 = gcd(minusOne, N)
    outputs.push([`Now we need to find the GCD of each of those two and N.`, `GCD(${plusOne}, ${N}) = ${gcd1}, and GCD(${minusOne}, ${N}) = ${gcd2}.`]);

    if (gcd1 * gcd2 == N && gcd1 !== 1 && gcd2 !== 1) {
       outputs.push([`The algorithm correctly found factors of ${N}! They are ${gcd1} and ${gcd2}.`]);
    } else {
       if (plusOne == N || minusOne == N) {
          outputs.push([`The algorithm seemed to work incorrectly. This can randomly happen depending on the g, so try again and hopefully it will work.`, `It didn't work because in this case, one of the guesses is ${N}, making their GCDs the trivial case of 1 and ${N}.`]);
       } else if (N%plusOne == 0 || N%minusOne == 0) {
          outputs.push([`The algorithm seemed to work incorrectly. This can randomly happen depending on the g, so try again and hopefully it will work.`, `It didn't work because in this case, one of the guesses is a multiple of ${N}, making their GCD values the trivial case of 1 and ${N}.`]);
       } else if (N%gcd1 == 0 && N%gcd2 == 0) {
          outputs.push([`In this case, the GCDs didn't correctly find THE SAME PAIR of factors, but ${gcd1} is a factor, and so is ${gcd2}. Now it's easy to find the other factors using simple division.`, `The two pairs of factors found are ${gcd1} and ${Math.floor(N/gcd1)}, and ${gcd2} and ${Math.floor(N/gcd2)}`]);
       }
    }

    stopLoadingAnimation();
    loadText(i);
}
