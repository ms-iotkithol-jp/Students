using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Description;
using IoTDPWebSQL.Models;
using System.Data.SqlClient;

namespace IoTDPWebSQL.Controllers
{
    public class SASSensorsController : ApiController
    {
        private iotdbEntities db = new iotdbEntities();

        // GET: api/SASSensors
        public IQueryable<SASSensor> GetSASSensor([FromUri] string till = "0", string during = "1")
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

            string sql = "select * from SASSensor where time >= @starttime AND time <= @endtime";
            SqlParameter startTime = new SqlParameter("starttime", specStartTime);
            SqlParameter endTime = new SqlParameter("endtime", specEndTime);
            DbSqlQuery<SASSensor> result = null;
            if (paq.Split('/').Last().ToLower() == "sassensors")
            {
                result = db.SASSensor.SqlQuery(sql, startTime, endTime);
            }
            else
            {
                SqlParameter targetId = new SqlParameter("targetId", paq.Split('/').Last());
                sql += " AND CONVERT(nvarchar(20),deviceId) = @targetId";
                result = db.SASSensor.SqlQuery(sql, startTime, endTime, targetId);
            }
            return result.AsQueryable();
            //          return db.SASSensor;
        }

        // GET: api/SASSensors/5
        [ResponseType(typeof(SASSensor))]
        public IHttpActionResult GetSASSensor(string id)
        {
            SASSensor sASSensor = db.SASSensor.Find(id);
            if (sASSensor == null)
            {
                return NotFound();
            }

            return Ok(sASSensor);
        }

        // PUT: api/SASSensors/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutSASSensor(string id, SASSensor sASSensor)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != sASSensor.msgId)
            {
                return BadRequest();
            }

            db.Entry(sASSensor).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SASSensorExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return StatusCode(HttpStatusCode.NoContent);
        }

        // POST: api/SASSensors
        [ResponseType(typeof(SASSensor))]
        public IHttpActionResult PostSASSensor(SASSensor sASSensor)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.SASSensor.Add(sASSensor);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateException)
            {
                if (SASSensorExists(sASSensor.msgId))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtRoute("DefaultApi", new { id = sASSensor.msgId }, sASSensor);
        }

        // DELETE: api/SASSensors/5
        [ResponseType(typeof(SASSensor))]
        public IHttpActionResult DeleteSASSensor(string id)
        {
            SASSensor sASSensor = db.SASSensor.Find(id);
            if (sASSensor == null)
            {
                return NotFound();
            }

            db.SASSensor.Remove(sASSensor);
            db.SaveChanges();

            return Ok(sASSensor);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool SASSensorExists(string id)
        {
            return db.SASSensor.Count(e => e.msgId == id) > 0;
        }
    }
}