using Microsoft.Azure;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Table;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace IoTDPWebTable.Controllers
{
    public class SASSensorController : ApiController
    {
        public IQueryable<Models.SASSensorTable> GetSASSensor([FromUri] string till = "0", string during = "1")
        {
             var reqUri = this.Request.RequestUri;
            var paq = reqUri.PathAndQuery;
            DateTime specStartTime = DateTime.Now;
            DateTime specEndTime = DateTime.Now;
            int paramStartIndex = paq.LastIndexOf("?");
            if (paramStartIndex > 0)
            {
                paq = paq.Split('?').First();
                double tempt, tempd;
                if (!double.TryParse(till, out tempt) || !double.TryParse(during, out tempd))
                {
                    throw new ArgumentOutOfRangeException("parameters should be real value!");
                }
            }
            var st = double.Parse(till);
            var sd = double.Parse(during);
            specEndTime = specEndTime.Subtract(TimeSpan.FromDays(st));
            specStartTime = specEndTime.Subtract(TimeSpan.FromDays(sd));

            var storeCS = CloudConfigurationManager.GetSetting("StorageConnectionString");
            var storageAccount = CloudStorageAccount.Parse(storeCS);
            var tableClient = storageAccount.CreateCloudTableClient();
            var sensorReadingTable = tableClient.GetTableReference("SASSensor");
            var query = new TableQuery<Models.SASSensorTable>().Where(
                TableQuery.CombineFilters(
                TableQuery.GenerateFilterConditionForDate("time", QueryComparisons.GreaterThanOrEqual, specStartTime),
                TableOperators.And,
                TableQuery.GenerateFilterConditionForDate("time", QueryComparisons.LessThanOrEqual, specEndTime)
                ));
            var results = sensorReadingTable.ExecuteQuery(query).Select((ent => (Models.SASSensorTable)ent)).ToList();
            return results.AsQueryable();
        }
    }
}

