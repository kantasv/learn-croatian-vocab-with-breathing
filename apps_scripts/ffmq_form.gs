// Finally, push this .gs file to github just in case

function myFunction() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("raw_data")
  const outputSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("scores")

  // Be careful: starting from 0th
  const lastRow = sheet.getLastRow()
  const lastColum = sheet.getLastColumn()

  const rawDataArray = sheet.getRange(1, 1, lastRow, lastColum).getValues()
  // ignore 1st row with value names
  const valueNamesIgnored = rawDataArray.filter((unused, idx) => idx !== 0)
  // ignore timestamp and participant ids
  const columIdsRemoved = [0, 1, 2]
  const strAnswerArray = valueNamesIgnored.map(row => {
    return row.filter((cell, cellIdx) => !columIdsRemoved.includes(cellIdx))
  })

  // Finally TODO: check if this value is valid or not
  const rawScoreMatrix = mapStrAnswersToRawScores(strAnswerArray)


  facetIdxes = [
    {
      label: "Observing",
      idxes: [1, 6, 11, 15, 20, 26, 31, 36].map(num=>num-1)
    },
    {
      label: "Nonreactivity",
      idxes: [4, 9, 19, 21, 24, 29, 33].map(num=>num-1)
    },
    {
      label: "Nonjudging",
      idxes: [3, 10, 14, 17, 25, 30, 35, 39].map(num=>num-1)
    },
    {
      label: "Describing",
      idxes: [2, 7, 12, 16, 22, 27, 32, 37].map(num=>num-1)
    },
    {
      label: "Acting with awareness",
      idxes: [5, 8, 13, 18, 23, 28, 34, 38].map(num=>num-1)
    }
  ]
  
  const facetScoreMatrix = rawScoreMatrix.map(row=>{
    // row: [1.0, 3.0, ..., 1.0] -> [{label: String , score: Number}]
    return facetIdxes.map(facet=>{
      return {
        label: facet.label,
        score: row.filter((unused, idx)=>facet.idxes.includes(idx)).reduce((a, b)=>a+b, 0)
      }
    })
  })


  // Calculate total score for each participants
  const totalScoresForEachParticipants = rawScoreMatrix.map(rowArray=>rowArray.reduce((a, b)=>a+b), 0)
  // Logger.log(totalScoresForEachParticipants)

  // header id, total, facet1, ..., facet5
  const headerItems = ['参加者番号', 'FFMQ total', ...facetIdxes.map(facet=>facet.label)]

  const participantIdColIdx = 1 
  const resultWithoutHeader = valueNamesIgnored.map((rowArr, rowIdx)=>{
    return [rowArr[participantIdColIdx], totalScoresForEachParticipants[rowIdx], ...facetScoreMatrix[rowIdx].map(facet=>facet.score)]
  })

  const results = [headerItems, ...resultWithoutHeader]

  // Set values to the output sheet ('scores')
  outputSheet.getRange(1, 1, results.length, results[0].length).setValues(results)

}


function mapStrAnswersToRawScores(strAnswerArray) {
  // assert range from 1 to 39
  const inversedItemNumbers = [3, 10, 14, 17, 25, 30, 35, 39, 12, 16, 22, 5, 8, 13, 18, 23, 28, 34, 38]
  // assert range from 0 to 38
  const inversedColIdxes = inversedItemNumbers.map(itemNumber => itemNumber - 1)
  return strAnswerArray.map((row) => {
    return row.map((cell, colIdx) => {
      const cellScore = convertCellStrToScore(cell)
      return inversedColIdxes.includes(colIdx) ? invertScore(cellScore) : cellScore
    })
  })
}


function invertScore(score) {
  const expectedInputs = [1, 2, 3, 4, 5]
  const expectedOutputs = [1, 2, 3, 4, 5]

  const invertedOne = 5 - score + 1
  // IO checks
  if (!expectedInputs.includes(score)) throw 'input is unexpected'
  if (!expectedOutputs.includes(invertedOne)) throw 'output is unexpected'

  return invertedOne
}

function convertCellStrToScore(strScore) {
  // assert input: String
  expectedStrScores = ['まったくあてはまらない', 'めったにあてはまらない', 'たまにあてはまる', 'しばしばあてはまる', 'いつもあてはまる']
  if (!expectedStrScores.includes(strScore)) throw 'strScore type is unexpected, so failed to convert choice str to score.'

  return expectedStrScores.indexOf(strScore) + 1
  // assert output range from 1 to 5
}
