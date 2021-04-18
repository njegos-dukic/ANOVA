let resetForm = () => 
{
  document.getElementById("warning").innerHTML = ""
  document.getElementById("table").innerHTML = ""
  document.getElementById("calculate-button").innerHTML = ""
  document.getElementById("alternatives-input").disabled = false;
  document.getElementById("alternatives-input").value = ""
  document.getElementById("observation-input").disabled = false;
  document.getElementById("observation-input").value = ""
  document.getElementById("confirmation-button").disabled = false;
  document.getElementById("middle-half").innerHTML = ""
  document.getElementById("right-half").innerHTML = ""
}

let createTable = async () =>
{
  document.getElementById("warning").innerHTML = ""

  let numberOfAlternatives = parseFloat(document.getElementById("alternatives-input").value, 10)
  let numberOfObservations = parseFloat(document.getElementById("observation-input").value, 10)

  if (!numberOfAlternatives >= 2 || !numberOfObservations >= 1)
  {
    document.getElementById("warning").innerHTML = `<p style="color: red;">Molimo unesite validne vrijednosti.</p>`
    return
  }

  document.getElementById("alternatives-input").disabled = true
  document.getElementById("observation-input").disabled = true
  document.getElementById("confirmation-button").disabled = true

  let tableFields = `<table><tr><th className="table-header"><p> ANOVA </p></th>`
  for (let a = 1; a <= numberOfAlternatives; a++)
    tableFields += `<th className="table-header"><p> Alternativa ${a} </p></th>`

  tableFields += `</tr>`

  for (let i = 1; i <= numberOfObservations; i++)
  {
    tableFields += `<tr><td id="measurement-tag"><p id="measurement-tag"> Mjerenje ${i}: </p></td>`
    for (let j = 1; j <= numberOfAlternatives; j++)
      tableFields += `<td><input id="field${i}${j}" placeholder="[${i}, ${j}]"/></td>`

    tableFields += `</tr>`;
  }

  tableFields += `<tr><td>Aritmetičke sredine: </td>`
  
  for (let i = 1; i <= numberOfAlternatives; i++)
    tableFields += `<td id=mean${i}></td>`

  tableFields += `</tr><tr><td>Efekti: </td>`
  
  for (let i = 1; i <= numberOfAlternatives; i++)
    tableFields += `<td id=effect${i}></td>`
    
  tableFields += `</tr></table>`

  document.getElementById("table").innerHTML += tableFields
  let calculateButton = `<button  id="calculate" onClick="calculate()" type="button">Izračunaj</button>`
  document.getElementById("calculate-button").innerHTML += calculateButton
}

let calculate = async () =>
{
  let means = []
  let totalMean = 0.0
  let effects = []
  let alphas = []
  let SSE = 0.0
  let SSA = 0.0
  let SST = 0.0
  let SASQ = 0.0
  let SESQ = 0.0
  let F = 0.0
  let FTABLE = 0.0

  let numberOfAlternatives = parseFloat(document.getElementById("alternatives-input").value, 10)
  let numberOfObservations = parseFloat(document.getElementById("observation-input").value, 10)

  let DFSSA = numberOfAlternatives - 1
  let DFSSE = numberOfAlternatives * (numberOfObservations - 1)

  let sum = 0.0;
  let totalSum = 0.0;

  let arithmetic = `<table><tr><td></td>`

  for (let i = 1; i <= numberOfAlternatives; i++)
  {
    sum = 0.0;

    for (let j = 1; j <= numberOfObservations; j++)
    {
      let element = document.getElementById(`field${j}${i}`)
      element.disabled = true
      let value = element.value
      sum += parseFloat(value, 10)
      totalSum += parseFloat(value, 10)
    }

    means.push(sum / numberOfObservations)
    document.getElementById(`mean${i}`).innerHTML = (sum / numberOfObservations).toFixed(4)
  }

  totalMean = totalSum / (numberOfAlternatives * numberOfObservations)

  for (let i = 1; i <= numberOfAlternatives; i++)
  {
    let effect = means[i - 1] - totalMean
    effects.push(effect)
    document.getElementById(`effect${i}`).innerHTML = effect.toFixed(4)
  }

  for (let j = 1; j <= numberOfAlternatives; j++)
  {
    for (let i = 1; i <= numberOfObservations; i++)
    {
      let element = document.getElementById(`field${i}${j}`).value

      SSE += (parseFloat(element) - means[j - 1]) * (parseFloat(element) - means[j - 1])
    }
  }

  for (let i = 1; i <= numberOfAlternatives; i++)
  {
    alphas.push(means[i - 1] - totalMean)
    SSA += (means[i - 1] - totalMean) * (means[i - 1] - totalMean)
  }

  SSA *= numberOfObservations

  for (let j = 1; j <= numberOfAlternatives; j++)
  {
    for (let i = 1; i <= numberOfObservations; i++)
    {
      let element = document.getElementById(`field${i}${j}`).value
      SST += (parseFloat(element) - totalMean) * (parseFloat(element) - totalMean)
    }
  }

  SASQ = SSA / DFSSA
  SESQ = SSE / DFSSE
  F = SASQ / SESQ
  FTABLE = jStat.centralF.inv(0.95, DFSSA, DFSSE)

  document.getElementById("middle-half").innerHTML += `<p>Ukupna SV: ${totalMean.toFixed(4)}.</p>`
  document.getElementById("middle-half").innerHTML += `<p>SSA: ${SSA.toFixed(4)}.</p>`
  document.getElementById("middle-half").innerHTML += `<p>SSE: ${SSE.toFixed(4)}.</p>`
  document.getElementById("middle-half").innerHTML += `<p>SST: ${SST.toFixed(4)}.</p>`
  document.getElementById("middle-half").innerHTML += `<p>SAsq: ${SASQ.toFixed(4)}.</p>`
  document.getElementById("middle-half").innerHTML += `<p>SEsq: ${SESQ.toFixed(4)}.</p>`
  document.getElementById("middle-half").innerHTML += `<p>DoFSSA: ${DFSSA.toFixed(4)}.</p>`
  document.getElementById("middle-half").innerHTML += `<p>DoFSSE: ${DFSSE.toFixed(4)}.</p>`
  document.getElementById("middle-half").innerHTML += `<p>F: ${F.toFixed(4)}.</p>`
  document.getElementById("middle-half").innerHTML += `<p>FTABLE: ${FTABLE.toFixed(4)}.</p>`

  if (F-0.0 > FTABLE-0.0)
    document.getElementById("warning").innerHTML = `<p style="color: red;">Razlike između alternativa su statistički značajne.</p>`
  else
    document.getElementById("warning").innerHTML = `<p style="color: red;">Razlike između alternativa nisu statistički značajne.</p>`


  document.getElementById("right-half").innerHTML += `<h4><u>KONTRASTI</u></h4>`
  

  console.log("Alpha1 = " + alphas[0])
  console.log("Alpha2 = " + alphas[1])
  console.log("Alpha3 = " + alphas[2])

  for (let i = 1; i <= numberOfAlternatives; i++)
    for (let j = i - 0 + 1; j <= numberOfAlternatives; j++)
    {
      let c = alphas[i - 1] - alphas[j - 1]
      let sc = Math.sqrt((2 * SESQ) / (numberOfAlternatives * numberOfObservations))
      let c1 = c - jStat.studentt.inv(0.95, DFSSE) * sc
      let c2 = c + jStat.studentt.inv(0.95, DFSSE) * sc

      if ((c1 - 0.0) * (c2 - 0.0) <= 0)
        document.getElementById("right-half").innerHTML += `<p>Alternative ${i} i ${j} se ne razlikuju.</p>`
      else
        document.getElementById("right-half").innerHTML += `<p>Alternative ${i} i ${j} se razlikuju.</p>`
    }
}