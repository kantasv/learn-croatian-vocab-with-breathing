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
  const columIdsRemoved = [0, 1]

  const strAnswerArray = valueNamesIgnored.map(row => {
    return row.filter((cell, cellIdx) => !columIdsRemoved.includes(cellIdx))
  })

  // Finally TODO: check if this value is valid or not
  const rawScoreMatrix = mapStrAnswersToRawScores(strAnswerArray)

  facetIdxes = [
    {
      label: "外向性",
      idxes: [1, 6, 11, 16, 21, 26, 31, 36, 41, 46].map(num => num - 1)
    },
    {
      label: "協調性",
      idxes: [2, 7, 12, 17, 22, 27, 32, 37, 42, 47].map(num => num - 1)
    },
    {
      label: "誠実性",
      idxes: [3, 8, 13, 18, 23, 28, 33, 38, 43, 48].map(num => num - 1)
    },
    {
      label: "神経症的傾向",
      idxes: [4, 9, 14, 19, 24, 29, 34, 39, 44, 49].map(num => num - 1)
    },
    {
      label: "開放性",
      idxes: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50].map(num => num - 1)
    }
  ]


  const facetScoreMatrix = rawScoreMatrix.map(row => {
    // row: [1.0, 3.0, ..., 1.0] -> [{label: String , score: Number}]
    return facetIdxes.map(facet => {
      return {
        label: facet.label,
        score: row.filter((unused, idx) => facet.idxes.includes(idx)).reduce((a, b) => a + b, 0)
      }
    })
  })


  
  // header id, facet1, ..., facet5
  const headerItems = ['参加者番号', ...facetIdxes.map(facet => facet.label)]

  const participantIdColIdx = 1
  const resultWithoutHeader = valueNamesIgnored.map((rowArr, rowIdx) => {
    return [rowArr[participantIdColIdx], ...facetScoreMatrix[rowIdx].map(facet => facet.score)]
  })

  const results = [headerItems, ...resultWithoutHeader]

  // Set values to the output sheet ('scores')
  outputSheet.getRange(1, 1, results.length, results[0].length).setValues(results)

}


function mapStrAnswersToRawScores(strAnswerArray) {
  // assert range from 1 to 50
  const inversedItemNumbers = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 29, 30, 32, 34, 36, 38, 39, 44, 46, 49]
  // assert range from 0 to 49
  const inversedColIdxes = inversedItemNumbers.map(itemNumber => itemNumber - 1)
  return strAnswerArray.map((row) => {
    return row.map((cell, colIdx) => {
      const cellScore = convertCellStrToScore(cell)
      if (![1, 2, 3, 4, 5].includes(cellScore)) throw 'cellScore is invalid'
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
  expectedStrScores = ['あてはまらない', 'ややあてはまらない', 'どちらともいえない', 'ややあてはまる', 'あてはまる']
  if (!expectedStrScores.includes(strScore)) throw 'strScore type is unexpected, so failed to convert choice str to score.'

  return expectedStrScores.indexOf(strScore) + 1
  // assert output range from 1 to 5
}
